/**
 * Logica de negocio del sistema para soportar msj de RCES
 * @module RCES
 */
import { Movistar } from "../lib/movistar";
import { RCES } from "../lib/rcesConnection";

/**
 * Instance de Movistar (Singleton)
 */
let movistar = Movistar.getInstance();

function connectRCES(socket: any) {
  console.log(
    `New connection from ${socket.remoteAddress} : ${socket.remotePort}`
  );
  let rcesConnection: RCES = new RCES(socket);
  rcesConnection.setSocketMovistar(movistar.getSocket());
}

export { connectRCES };
