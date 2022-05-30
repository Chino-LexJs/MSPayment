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
import { util_unpack, util_unpack_0210_0430 } from "./util/util_unpack";
import { MTI0430 } from "./lib/MTI_0430";
import { getReverseByRequestId } from "./db/getReverseById";
import { setIsoMessage0430 } from "./db/setIsoMessage0430";

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
let socketMovistar: any; // variable que contiene la conexion socket unica con Movistar
/**
 * Arreglo que guarda las distintas conexiones sockets de RCES de la siguiente forma
 * {
 *    socket: es la conexion socket de RCES
 *    trancenr: es el id de Request de RCES (P-11 y P-37)
 * }
 */
let rcesClients = new Map();

// Funciones
/**
 * Funcion que sirve para enviar msj reversos a MOVISTAR, segun el tiempo que se describa en la funcion setIinterval()
 */
async function loopReverses() {
  let reverses = await getReverses(); // mensajes reversos con isomessage430_id IS NULL [{reverse1}, {reverse2}...]
  console.log(
    `\nBuscando Reverses\nSe encontraron: ${reverses.length} mensajes reversos sin respuesta 0430`
  );
  reverses.forEach(async (reverse: { [key: string]: string | number }) => {
    let mti0420: any = await getMessageById(Number(reverse.isomessage420_id));
    console.log("\nMensaje 0420 a Movistar:");
    console.log(mti0420.message.toString());
    socketMovistar.write(mti0420.message.toString(), "utf8");
    await addRetrie(Number(reverse.id), Number(reverse.retries) + 1);
  });
}
async function sendMessage0420(mti0210: MTI0210) {
  let fields0420: { [key: string]: string } = {};
  let fields0210 = mti0210.getFields();
  const SE_USA = 3;
  const VALOR = 4;
  // Los parametros que se envian en el msj 0420 son similares al 0200 por lo que se copian los valores
  for (const key in fields0210) {
    if (fields0210[key][SE_USA]) {
      fields0420[key] = fields0210[key][VALOR].toString();
    }
  }
  let mti0420 = new MTI0420(fields0420, "0420");
  console.log("\nMensaje 0420 a Movistar en formato ISO8583:");
  console.log(mti0420.getMessage());
  console.log("\nData elements usados en el msj 0420 a Movistar: ");
  console.log(mti0420.getFields());
  socketMovistar.write(mti0420.getMessage(), "utf8");
  let valuesMessage = {
    date: new Date(),
    time: new Date(),
    type: Number(mti0420.getMti()),
    messagedate: new Date(),
    messagetime: new Date(),
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
}
async function message0210(message: string) {
  console.log("\nMensaje 0210 de MOVISTAR en formato ISO8583:");
  console.log(message);
  let newFieldes: { [key: string]: string } = util_unpack_0210_0430(message);
  console.log("\nData elements de msj 0210 de Movistar: ");
  console.log(newFieldes);
  let mti0210 = new MTI0210(newFieldes, "0210");
  /**
   * getMessage(trancenr) busca el mensaje 0200 que se envio a Movistar
   * res es el mensaje guardado en la base de datos de tipo 0200
   */
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
    sendMessage0420(mti0210);
  } else {
    // se guarda msj 0210, se genera un msj 0210 para RCES y se envia msj a RCES
    let values = {
      date: new Date(),
      time: new Date(),
      type: Number(mti0210.getMti()),
      messagedate: new Date(), // P-7 se crea en el momento en TransmissionDateTime() en archivo util_propsToFields
      messagetime: new Date(), // P-7 se crea en el momento en TransmissionDateTime() en archivo util_propsToFields
      tracenr: mti0210.getTrancenr(),
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
    let client = rcesClients.has(mti0210.getTrancenr())
      ? rcesClients.get(mti0210.getTrancenr())
      : undefined;
    if (client != undefined) {
      client.write(mti0210.getMessage(), "utf8");
      console.log("\nMensaje que se envia a RCES en formato RCES");
      console.log(mti0210.getMessage());
      rcesClients.delete(mti0210.getTrancenr());
      client.end();
    } else {
      console.log("\nNo se encontro cliente, se envia msj 0420 a Movistar");
      sendMessage0420(mti0210);
    }
  }
}
async function message0430(message: string) {
  console.log("\nMensaje 0430 de MOVISTAR en formato ISO8583:");
  console.log(message);
  let newFieldes: { [key: string]: string } = util_unpack_0210_0430(message);
  console.log(newFieldes);
  let mti0430 = new MTI0430(newFieldes, "0430");
  getReverseByRequestId(mti0430.getTrancenr()).then(async (reverses) => {
    if (reverses.length != 0) {
      reverses.forEach(async (reverse: any) => {
        if (reverse.isomessage430_id == null) {
          let values = {
            date: new Date(),
            time: new Date(),
            type: Number(mti0430.getMti()),
            messagedate: new Date(), // P-7 se crea en el momento en TransmissionDateTime() en archivo util_propsToFields
            messagetime: new Date(), // P-7 se crea en el momento en TransmissionDateTime() en archivo util_propsToFields
            tracenr: mti0430.getTrancenr(),
            message: mti0430.getMessage(),
          };
          let id_message0430 = await saveMessage(
            values.date,
            values.time,
            values.type,
            values.messagedate,
            values.messagetime,
            values.tracenr,
            values.message
          );
          await setIsoMessage0430(reverse.id, id_message0430);
        }
      });
    }
  });
}
async function messageFromRCES(message: string): Promise<number> {
  let dataUnpack: { [key: string]: string } = util_unpack(message);
  console.log("\nMensage de RCES deslozado: ");
  console.log(dataUnpack);
  console.log("\n");
  let posdate = new Date(
    Number(dataUnpack.POS_DATE.substr(0, 4)),
    Number(dataUnpack.POS_DATE.substr(4, 2)),
    Number(dataUnpack.POS_DATE.substr(6))
  );
  let postime = new Date(
    Number(dataUnpack.POS_DATE.substr(0, 4)),
    Number(dataUnpack.POS_DATE.substr(4, 2)),
    Number(dataUnpack.POS_DATE.substr(6)),
    Number(dataUnpack.POS_TIME.substr(0, 2)),
    Number(dataUnpack.POS_TIME.substr(2, 2)),
    Number(dataUnpack.POS_TIME.substr(4))
  );
  let valuesRequest = {
    date_request: new Date(),
    time_request: new Date(),
    ip: 12, // IP DEL CLIENTE AVERIGUAR COMO RECUPERAR DESDE SOCKET
    account_id: Number(dataUnpack.ACCOUNT_ID),
    pos_id: Number(dataUnpack.POS_ID),
    pos_name: dataUnpack.POS_NAME,
    pos_state: dataUnpack.POS_STATE,
    postimezona: Number(dataUnpack.POS_TIME_ZONE),
    posdate,
    postime,
    dnb: dataUnpack.DNB,
    amount: Number(dataUnpack.AMOUNT),
    productgroup: dataUnpack.PRODUCT_GROUP,
    product_nr: Number(dataUnpack.PRODUCT_NR),
    responsedate: new Date(), // modificar para que parametro pueda ser null en primera instancia y cuando movistar responda se llene el campo
    responsetime: new Date(), // modificar para que parametro pueda ser null en primera instancia y cuando movistar responda se llene el campo
    responsecode: Number(dataUnpack.RESPONSE_CODE),
    authorizationnr: Number(dataUnpack.AUTORIZATION_NR),
    error: 0, // HARDCODEADO
    action: Number(dataUnpack.ACTION),
    reverse_id: 0, // modificar para que parametro pueda ser null en primera instancia y cuando se cree el reverso se lo asocie
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
  let valuesMessage = {
    date: new Date(),
    time: new Date(),
    type: 200,
    messagedate: new Date(), // P-7 se crea en el momento en TransmissionDateTime() en archivo util_propsToFields
    messagetime: new Date(), // P-7 se crea en el momento en TransmissionDateTime() en archivo util_propsToFields
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
  dataUnpack.SYSTEMS_TRANCE = id_request.toString().slice(-6); // Si el numero supera los 6 digitos P-11 solo capta hasta 6 digitos
  dataUnpack.RETRIEVAL_REFERENCE_NUMBER = id_request.toString();
  let mti0200 = new MTI0200(dataUnpack, "0200");
  console.log("\nData elements generados por el msj 0200 de RCES:");
  console.log(mti0200.getFields());
  console.log(
    "\nMensaje 0200 en formato ISO8583 enviado a Movistar: \n",
    mti0200.getMessage()
  );
  socketMovistar.write(mti0200.getMessage(), "utf8");
  return id_request;
}

/**
 * Funcion que genera conexion socket con Movistar
 */
function connectMovistar() {
  socketMovistar = new Socket();
  socketMovistar.connect(to_MOVISTAR);
  socketMovistar.setEncoding("utf8"); // se configura socket para manejar cadena de caracteres en el buffer[]
  socketMovistar.on("data", async (message: string) => {
    let mtiMessage = message.substr(0, 4);
    switch (mtiMessage) {
      case "0210":
        message0210(message);
        break;
      case "0430":
        message0430(message);
        break;
      default:
        console.log("\nTipo de mensaje (MTI) no soportado por el Servidor");
        break;
    }
  });
  socketMovistar.on("close", () => {
    console.log(`\nComunicacion con MOVISTAR finalizada`);
    connectMovistar(); // Siempre debe intentar conectarse a Movistar
  });
  socketMovistar.on("error", (err: Error): void => {
    console.log(err);
  });
}

// Server Settings para distintas conexiones sockets de RCES
server.on("connection", (socket: any) => {
  console.log(
    `New connection from ${socket.remoteAddress} : ${socket.remotePort}`
  );
  socket.setEncoding("utf8"); // se configura socket para manejar cadena de caracteres en el buffer[]
  socket.on("data", async (message: string) => {
    console.log("\nMensaje de RCES sin formato: ");
    console.log(message, "\n");
    let id_request = await messageFromRCES(message);
    rcesClients.set(id_request, socket);
  });
  socket.on("close", () => {
    for (let client of rcesClients.keys()) {
      if (socket == rcesClients.get(client)) {
        rcesClients.delete(client);
      }
    }
    console.log(`\nComunicacion finalizada con RCS`);
  });
  // Don't forget to catch error, for your own sake.
  socket.on("error", function (err: Error) {
    console.log(`Error: ${err}`);
  });
});

// Start Server
server.listen({ port, host }, async () => {
  console.log(`Server on port: ${server.address().port}`);
  setInterval(loopReverses, 10000);
  connectMovistar();
});
