import { movistar } from "./connection/movistar";
import { connectRCES } from "./rces/rces";
import { loopEcho, loopReverses } from "./loop/loops";

const { Server } = require("net"),
  server = new Server(),
  TIEMPO_LOOP_REVERSE = 30000, // Tiempo (milisegundos) para que el sistema busque y envie reversos
  TIEMPO_LOOP_ECHO = 60000;

// Configuracón del Server para distintas conexiones sockets de RCES
server.on("connection", (socket: any) => connectRCES(socket));

async function main() {
  setInterval(loopReverses, TIEMPO_LOOP_REVERSE);
  setInterval(loopEcho, TIEMPO_LOOP_ECHO);
  movistar.connect();
}

export { server, main };
