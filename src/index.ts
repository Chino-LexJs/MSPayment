import { saveMessage } from "./db/saveMessage";
import { saveRequest } from "./db/saveRequest";
import { MTI0200 } from "./lib/MTI_0200";
import { MTI0210 } from "./lib/MTI_0210";
import { util_unpack, util_unpack_0210 } from "./util/util_unpack";

const { Server, Socket } = require("net");

const port = 3000;
const host = "0.0.0.0";
const to_MOVISTAR = {
  host: "localhost",
  port: 8000,
};
let socketMovistar: any;

const server = new Server();

server.on("connection", (socket: any) => {
  console.log(
    `New connection from ${socket.remoteAddress} : ${socket.remotePort}`
  );
  socket.setEncoding("utf8");
  socket.on("data", async (message: string) => {
    let dataUnpack: { [key: string]: string } = util_unpack(message);
    console.log(dataUnpack);
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
    console.log("id de la solicitud");
    console.log(id_request);
    let mti0200 = new MTI0200(dataUnpack, "0200");
    console.log(mti0200.getFields());
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
    console.log("ID del message");
    console.log(id_message);
    console.log(mti0210.getMessage());
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
  connectMovistar();
});
