import { MTI0200 } from "./lib/MTI_0200";
import { MTI0210 } from "./lib/MTI_0210";
import { fields } from "./util/fields";
import { util_unpack, util_unpack_0210 } from "./util/util_unpack";

const { Server, Socket } = require("net");

const port = 3000;
const host = "0.0.0.0";
const to_PROSA = {
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
  socket.on("data", (message: string) => {
    let dataUnpack: { [key: string]: string } = util_unpack(message);
    console.log(dataUnpack);
    let mti0200 = new MTI0200(dataUnpack, "0200");
    // console.log(fields);
    // console.log(message.length);
    // console.log(dataUnpack);
    // console.log(mti0200.getMessage());
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
  socketMovistar.connect(to_PROSA);
  socketMovistar.setEncoding("utf8");
  socketMovistar.on("data", async (message: string) => {
    console.log("Mensaje de MOVISTAR:");
    console.log(message);
    let newFieldes: { [key: string]: string } = util_unpack_0210(message);
    let mti0210 = new MTI0210(newFieldes, "0210");
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
