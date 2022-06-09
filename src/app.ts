import { connectMovistar } from "./services/movistar/connectMovistar";
import { loopEcho, loopReverses } from "./services/loop/loops";
import { messageFromRCES } from "./services/rces/messageRCES";
import {
  closeConnection,
  saveConnection,
} from "./services/rces/socketConnections";

const { Server } = require("net"),
  server = new Server(),
  TIEMPO_CONEXION_RCES = 55000, // Tiempo (milisegundos) limite para conexion con socket RCES
  TIEMPO_LOOP_REVERSE = 30000, // Tiempo (milisegundos) para que el sistema busque y envie reversos
  TIEMPO_LOOP_ECHO = 60000;

// Configuracón del Server para distintas conexiones sockets de RCES
server.on("connection", (socket: any) => {
  console.log(
    `New connection from ${socket.remoteAddress} : ${socket.remotePort}`
  );
  socket.setEncoding("utf8"); // se configura socket para manejar cadena de caracteres en el buffer[]
  socket.on("data", async (message: string) => {
    console.log("\nMensaje de RCES sin formato: ");
    console.log(message);
    let id_request = await messageFromRCES(message, socket.remoteAddress);
    saveConnection(id_request, socket);
  });
  socket.on("close", () => {
    closeConnection(socket);
    console.log(`\nComunicacion finalizada con RCS`);
  });
  socket.on("error", function (err: Error) {
    console.log(`Error: ${err}`);
  });
  socket.setTimeout(TIEMPO_CONEXION_RCES); // Tiempo limite de conexión
  socket.on("timeout", () => {
    console.log("Connexion socket con RCES timeout");
    socket.end();
  });
});

async function main() {
  setInterval(loopReverses, TIEMPO_LOOP_REVERSE);
  setInterval(loopEcho, TIEMPO_LOOP_ECHO);
  connectMovistar();
}

export { server, main };
