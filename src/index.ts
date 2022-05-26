import { getMessage } from "./db/getMessage";
import { getReverses } from "./db/getReverses";
import { saveMessage } from "./db/saveMessage";
import { saveRequest } from "./db/saveRequest";
import { addRetrie } from "./db/addRetrie";
import { saveReverse } from "./db/saveReverse";
import { getMessageById } from "./db/getMessageById";
import { MTI0200 } from "./lib/MTI_0200";
import { MTI0210 } from "./lib/MTI_0210";
import { util_unpack, util_unpack_0210 } from "./util/util_unpack";
import { MTI0420 } from "./lib/MTI_0420";

const { Server, Socket } = require("net");

const port = 3000;
const host = "0.0.0.0";
const to_MOVISTAR = {
  host: "localhost",
  port: 8000,
};
let socketMovistar: any;
let rcesClients: any[] = [];

const server = new Server();

/**
 * Funcion que sirve para enviar msj reversos a MOVISTAR cada 55 segundos
 */
async function loopReverses() {
  console.log("Buscando Reverses");
  let reverses = await getReverses(); // mensajes reversos con isomessage430_id IS NULL [{reverse1}, {reverse2}...]
  reverses.forEach(async (reverse: { [key: string]: string | number }) => {
    let mti0420: any = await getMessageById(Number(reverse.isomessage420_id));
    socketMovistar.write(mti0420.message.toString(), "utf8");
    await addRetrie(Number(reverse.id), Number(reverse.retries) + 1);
  });
}

server.on("connection", (socket: any) => {
  console.log(
    `New connection from ${socket.remoteAddress} : ${socket.remotePort}`
  );
  socket.setEncoding("utf8");

  socket.on("data", async (message: string) => {
    let dataUnpack: { [key: string]: string } = util_unpack(message);
    // console.log(dataUnpack);
    let values = {
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
      values.date_request,
      values.time_request,
      values.ip,
      values.account_id,
      values.pos_id,
      values.pos_name,
      values.pos_state,
      values.postimezona,
      values.posdate,
      values.postime,
      values.dnb,
      values.amount,
      values.productgroup,
      values.product_nr,
      values.responsedate,
      values.responsetime,
      values.responsecode,
      values.authorizationnr,
      values.error,
      values.action,
      values.reverse_id
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
    // console.log(mti0200.getFields());
    socketMovistar.write(mti0200.getMessage(), "utf8");
  });
  socket.on("close", () => {
    console.log(`Comunicacion finalizada con RCS`);
  });
  // Don't forget to catch error, for your own sake.
  socket.on("error", function (err: Error) {
    console.log(`Error: ${err}`);
  });
});

function connectMovistar() {
  socketMovistar = new Socket();
  socketMovistar.connect(to_MOVISTAR);
  socketMovistar.setEncoding("utf8");
  socketMovistar.on("data", async (message: string) => {
    console.log("Mensaje de MOVISTAR:");
    console.log(message);
    let newFieldes: { [key: string]: string } = util_unpack_0210(message);
    let mti0210 = new MTI0210(newFieldes, "0210");
    let res: any = await getMessage(mti0210.getTrancenr());
    // console.log("Mensaje 0200 de la base de datos:");
    // console.log(res);
    let jsonDate = {
      year: new Date(res.date).getFullYear(),
      month: new Date(res.date).getMonth(),
      day: new Date(res.date).getDate(),
      hour: res.time.slice(0, 2),
      minutes: res.time.slice(3, 5),
      seconds: res.time.slice(6),
    };
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
    if (difDates > 55) {
      // se envia msj 0420 y se genera un elemento reverso en la tabla de reversos de la DB
      let fields0420: { [key: string]: string } = {};
      let fields0210 = mti0210.getFields();
      for (const key in fields0210) {
        if (fields0210[key][3]) {
          fields0420[key] = fields0210[key][4].toString();
        }
      }
      let mti0420 = new MTI0420(fields0420, "0420");
      // socketMovistar.write(mti0420.getMessage(), "utf8");
      let valuesMessage = {
        date: new Date(), // HARDCODEADO
        time: new Date(), // HARDCODEADO
        type: Number(mti0420.getMti()),
        messagedate: new Date(), // HARDCODEADO
        messagetime: new Date(), // HARDCODEADO
        tracenr: Number(mti0420.getTrancenr()),
        message: mti0210.getMessage(),
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
      let id_reverse = await saveReverse(
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
        type: Number(newFieldes.MTI),
        messagedate: new Date(), // HARDCODEADO
        messagetime: new Date(), // HARDCODEADO
        tracenr: Number(newFieldes.SystemsTraceAuditNumber),
        message: mti0210.getMessage(),
      };
      let id_message = await saveMessage(
        values.date,
        values.time,
        values.type,
        values.messagedate,
        values.messagetime,
        values.tracenr,
        values.message
      );
      // console.log("ID del message");
      // console.log(id_message);

      rcesClients.forEach((client: any) => {
        if (client.trancenr === Number(mti0210.getTrancenr())) {
          client.socket.write(mti0210.getMessage(), "utf8");
          console.log("MENSAJE ENVIADO A RCES");
          console.log(mti0210.getMessage());
        }
      });
    }
  });
  socketMovistar.on("close", () => {
    console.log(`Comunicacion con MOVISTAR finalizada`);
  });
  socketMovistar.on("error", (err: Error): void => {
    console.log(err);
  });
}
server.listen({ port, host }, async () => {
  console.log(`Server on port: ${server.address().port}`);
  setInterval(loopReverses, 10000);
  connectMovistar();
});
