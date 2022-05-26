import { getMessage } from "./db/getMessage";
import { getReverses } from "./db/getReverses";
import { saveMessage } from "./db/saveMessage";
import { saveRequest } from "./db/saveRequest";
import { addRetrie } from "./db/addRetrie";
import { saveReverse } from "./db/saveReverse";
import { getMessageById } from "./db/getMessageById";
import { MTI0200 } from "./lib/MTI_0200";
import { MTI0210 } from "./lib/MTI_0210";
import { MTI0420 } from "./lib/MTI_0420";
import { util_unpack, util_unpack_0210 } from "./util/util_unpack";

// Constantes
const { Server, Socket } = require("net");
const port = 3000;
const host = "0.0.0.0";
const to_MOVISTAR = {
  host: "localhost",
  port: 8000,
};
const TIEMPO_RESPUESTA_MOVISTAR = 20;
const server = new Server();

// Variables Globales
let socketMovistar: any; // variable que contiene la conexion socket con Movistar
/**
 * Arreglo que guarda las distintas conexiones sockets de RCES de la siguiente forma
 * {
 *    socket: es la conexion socket de RCES
 *    trancenr: es el id de Request de RCES
 * }
 */
let rcesClients: any[] = [];

// Funciones
/**
 * Funcion que sirve para enviar msj reversos a MOVISTAR, segun el tiempo que se describa en la funcion setIinterval()
 */
async function loopReverses() {
  console.log("Buscando Reverses");
  let reverses = await getReverses(); // mensajes reversos con isomessage430_id IS NULL [{reverse1}, {reverse2}...]
  console.log(
    `Se encontraron: ${reverses.length} mensajes reversos sin respuesta 0430`
  );
  reverses.forEach(async (reverse: { [key: string]: string | number }) => {
    let mti0420: any = await getMessageById(Number(reverse.isomessage420_id));
    socketMovistar.write(mti0420.message.toString(), "utf8");
    await addRetrie(Number(reverse.id), Number(reverse.retries) + 1);
  });
}
/**
 * Funcion que genera conexion socket con Movistar
 */
function connectMovistar() {
  socketMovistar = new Socket();
  socketMovistar.connect(to_MOVISTAR);
  socketMovistar.setEncoding("utf8");
  socketMovistar.on("data", async (message: string) => {
    console.log("Mensaje de MOVISTAR:");
    console.log(message);
    let newFieldes: { [key: string]: string } = util_unpack_0210(message); // se desempaqueta el msj de Movistar en un json para crear instancia de clase 0210
    let mti0210 = new MTI0210(newFieldes, "0210");
    console.log(newFieldes);
    console.log(mti0210.getFields());
    let res: any = await getMessage(mti0210.getTrancenr());
    let jsonDate = {
      year: new Date(res.date).getFullYear(),
      month: new Date(res.date).getMonth(),
      day: new Date(res.date).getDate(),
      hour: res.time.slice(0, 2),
      minutes: res.time.slice(3, 5),
      seconds: res.time.slice(6),
    };
    /**
     * difDates contiene la diferencia de tiempo en segundos entre la hora en que se envio el msj 0200 a Movistar y la hora de respuesta 0210
     */
    let difDates = Math.round(
      (new Date().getTime() -
        new Date(
          jsonDate.year,
          jsonDate.month,
          jsonDate.day,
          jsonDate.hour,
          jsonDate.minutes,
          jsonDate.seconds
        ).getTime()) /
        1000
    );
    if (difDates > TIEMPO_RESPUESTA_MOVISTAR) {
      // se envia msj 0420 y se genera un elemento reverso en la tabla de reversos de la DB
      let fields0420: { [key: string]: string } = {}
      let fields0210 = mti0210.getFields();
      // Los parametros que se envian en el msj 0420 son similares al 0200 por lo que se copian los valores
      for (const key in fields0210) {
        if (fields0210[key][3]) {
          fields0420[key] = fields0210[key][4].toString();
        }
      }
      let mti0420 = new MTI0420(fields0420, "0420");
      socketMovistar.write(mti0420.getMessage(), "utf8");
      let valuesMessage = {
        date: new Date(), // HARDCODEADO
        time: new Date(), // HARDCODEADO
        type: Number(mti0420.getMti()),
        messagedate: new Date(), // HARDCODEADO
        messagetime: new Date(), // HARDCODEADO
        tracenr: Number(mti0420.getTrancenr()),
        message: mti0420.getMessage(),
      };
      let id_mti0420 = await saveMessage(
        valuesMessage.date,
        valuesMessage.time,
        valuesMessage.type,
        valuesMessage.messagedate,
        valuesMessage.messagetime,
        valuesMessage.tracenr,
        valuesMessage.message
      );
      let values = {
        date: new Date(),
        time: new Date(),
        request_id: mti0210.getTrancenr(),
        isomessage420_id: id_mti0420,
        responsecode: mti0420.getResponseCode(),
        referencenr: 123,
        retries: 1,
      };
      await saveReverse(
        values.date,
        values.time,
        values.request_id,
        values.isomessage420_id,
        values.responsecode,
        values.referencenr,
        values.retries
      );
    } else {
      // se guarda msj 0210, se genera un msj 0210 para RCES y se envia msj a RCES
      let values = {
        date: new Date(), // HARDCODEADO
        time: new Date(), // HARDCODEADO
        type: Number(mti0210.getMti()),
        messagedate: new Date(), // HARDCODEADO
        messagetime: new Date(), // HARDCODEADO
        tracenr: Number(newFieldes.SystemsTraceAuditNumber),
        message: mti0210.getMessage(),
      };
      await saveMessage(
        values.date,
        values.time,
        values.type,
        values.messagedate,
        values.messagetime,
        values.tracenr,
        values.message
      );
      /**
       * Se busca entre las distintas conexiones que se establecieron con RCES y se envia la respuesta 0210 a la conexion correspondiente
       */
      rcesClients.forEach((client: any) => {
        if (client.trancenr === Number(mti0210.getTrancenr())) {
          client.socket.write(mti0210.getMessage(), "utf8");
          client.socket.end();
          console.log("MENSAJE ENVIADO A RCES");
          console.log(mti0210.getMessage());
        }
      });
    }
  });
  socketMovistar.on("close", () => {
    console.log(`Comunicacion con MOVISTAR finalizada`);
    connectMovistar(); // Siempre debe intentar conectarse a Movistar
  });
  socketMovistar.on("error", (err: Error): void => {
    console.log(err);
  });
}

// Server Settings
server.on("connection", (socket: any) => {
  console.log(
    `New connection from ${socket.remoteAddress} : ${socket.remotePort}`
  );
  socket.setEncoding("utf8");
  socket.on("data", async (message: string) => {
    let dataUnpack: { [key: string]: string } = util_unpack(message);
    let valuesRequest = {
      date_request: new Date(), // HARDCODEADO
      time_request: new Date(), // HARDCODEADO
      ip: 12, // HARDCODEADO
      account_id: Number(dataUnpack.ACCOUNT_ID),
      pos_id: Number(dataUnpack.POS_ID),
      pos_name: dataUnpack.POS_NAME,
      pos_state: dataUnpack.POS_STATE,
      postimezona: 52, // HARDCODEADO
      posdate: new Date(), // HARDCODEADO
      postime: new Date(), // HARDCODEADO
      dnb: dataUnpack.DNB,
      amount: Number(dataUnpack.AMOUNT),
      productgroup: dataUnpack.PRODUCT_GROUP,
      product_nr: Number(dataUnpack.PRODUCT_NR),
      responsedate: new Date(), // HARDCODEADO
      responsetime: new Date(), // HARDCODEADO
      responsecode: Number(dataUnpack.RESPONSE_CODE),
      authorizationnr: Number(dataUnpack.AUTORIZATION_NR),
      error: 12, // HARDCODEADO
      action: 12, // HARDCODEADO
      reverse_id: 12, // HARDCODEADO
    };
    let id_request = await saveRequest(
      valuesRequest.date_request,
      valuesRequest.time_request,
      valuesRequest.ip,
      valuesRequest.account_id,
      valuesRequest.pos_id,
      valuesRequest.pos_name,
      valuesRequest.pos_state,
      valuesRequest.postimezona,
      valuesRequest.posdate,
      valuesRequest.postime,
      valuesRequest.dnb,
      valuesRequest.amount,
      valuesRequest.productgroup,
      valuesRequest.product_nr,
      valuesRequest.responsedate,
      valuesRequest.responsetime,
      valuesRequest.responsecode,
      valuesRequest.authorizationnr,
      valuesRequest.error,
      valuesRequest.action,
      valuesRequest.reverse_id
    );
    rcesClients.push({
      socket: socket,
      trancenr: id_request,
    });
    let valuesMessage = {
      date: new Date(), // HARDCODEADO
      time: new Date(), // HARDCODEADO
      type: 200,
      messagedate: new Date(), // HARDCODEADO
      messagetime: new Date(), // HARDCODEADO
      tracenr: id_request,
      message: message,
    };
    await saveMessage(
      valuesMessage.date,
      valuesMessage.time,
      valuesMessage.type,
      valuesMessage.messagedate,
      valuesMessage.messagetime,
      valuesMessage.tracenr,
      valuesMessage.message
    );
    dataUnpack.SYSTEMS_TRANCE = id_request.toString();
    let mti0200 = new MTI0200(dataUnpack, "0200");
    socketMovistar.write(mti0200.getMessage(), "utf8");
  });
  socket.on("close", () => {
    console.log(`Comunicacion finalizada con RCS`);
    rcesClients.forEach((client) => {
      let index = rcesClients.indexOf(client);
      rcesClients.splice(index, 1);
    });
  });
  // Don't forget to catch error, for your own sake.
  socket.on("error", function (err: Error) {
    console.log(`Error: ${err}`);
  });
});
server.listen({ port, host }, async () => {
  console.log(`Server on port: ${server.address().port}`);
  setInterval(loopReverses, 10000);
  connectMovistar();
});
