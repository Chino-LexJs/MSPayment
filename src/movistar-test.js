/**
 * Servidor Server de prueba para simular la comunicacion con MOVISTAR
 */

const Socket = require("net").Socket,
  { Server } = require("net");

const port = 8000;
const host = "0.0.0.0";

const server = new Server();
var socket = new Socket();

var message_0200 =
  "0210B23A80012EA080180000000014000004650000000000005000051413452204084713452205140514051403917170000000000000000=00001041831585332600TARE000001      0000000000                            MX484012B917PRO1-000013            P0391704TARE067MOVIA4776154695                                                    ^C";
var message_0430 =
  "0430B22000012A8080000000004004000004650000000000010000120115255542804803917170000000000000000=00000975787800TARE000001      48402000000097578781201150556001201          04TARE067MOVIA4776202955                                                    ";

server.on("connection", (socket) => {
  console.log(
    `New connection from ${socket.remoteAddress} : ${socket.remotePort}`
  );
  socket.setEncoding("utf8");
  socket.on(
    "data",
    async (message) => {
      console.log("Mensaje recibido:");
      console.log(message);
      if (message.substr(0, 16) === "ISO0013000550200") {
        message_0200 = "".concat(
          message_0200.substr(0, 112),
          message.substr(122, 12),
          message_0200.substr(124)
        );
        function sendMessage() {
          socket.write(message_0200);
          console.log("Mensaje enviado");
        }
        setTimeout(sendMessage, 21000);
      }
      if (message.substr(0, 16) === "ISO0013000550420") {
        message_0430 = "".concat(
          message_0430.substr(0, 94),
          message.substr(128, 12),
          message_0430.substr(106)
        );
        function sendMessage() {
          socket.write(message_0430);
          console.log("Mensaje enviado");
        }
        setTimeout(sendMessage, 10000);
      }
    },
    "uft8"
  );
});

server.listen({ port, host }, () => {
  console.log(`Server MOVISTAR on port: ${port}`);
});
