/**
 * Distintas funciones principales del sistema
 * @module Server
 */
import { connectRCES } from "./rces/rces";
import { loopEcho, loopReverses } from "./loop/loops";
import { Movistar } from "./lib/movistar";

/**
 * Instance de Movistar (Singleton)
 */
let movistar = Movistar.getInstance();

const { Server } = require("net"),
  server = new Server(),
  TIEMPO_LOOP_REVERSE = 30000,
  TIEMPO_LOOP_ECHO = 60000;

/**
 * Configuracion del server para que conteste a los distintos mensajes RCES entrantes
 */
server.on("connection", (socket: any) => connectRCES(socket));
/**
 * Funcion principal del sistema
 */
async function main() {
  setInterval(loopReverses, TIEMPO_LOOP_REVERSE);
  setInterval(loopEcho, TIEMPO_LOOP_ECHO);
  setInterval(() => movistar.connect(), 1000);
}

export { server, main };
