/**
 * Servidor Server de prueba para simular la comunicacion con MOVISTAR
 */

const Socket = require("net").Socket,
  { Server } = require("net");

const port = 8000;
const host = "0.0.0.0";

const server = new Server();
var socket = new Socket();

var messageToProsa =
  "0210B23A80012EA080180000000014000004650000000000005000051413452204084713452205140514051403917170000000000000000=00001041831585332600TARE000001      0000000000                            MX484012B917PRO1-000013            P0391704TARE067MOVIA4776154695                                                    ^C";
server.on("connection", (socket) => {
  console.log(
    `New connection from ${socket.remoteAddress} : ${socket.remotePort}`
  );
  // socket = new JsonSocket(socket);
  socket.setEncoding("utf8");
  socket.on(
    "data",
    (message) => {
      console.log("Mensaje recibido:");
      console.log(message);
      if (message.substr(0, 3) === "ISO") {
        messageToProsa = "".concat(
          messageToProsa.substr(0, 112),
          message.substr(122, 12),
          messageToProsa.substr(124)
        );
        function sendMessage() {
          socket.write(messageToProsa);
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
