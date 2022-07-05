"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRCES = void 0;
/**
 * Logica de negocio del sistema para soportar msj de RCES
 * @module RCES
 */
const movistar_1 = require("../lib/movistar");
const rcesConnection_1 = require("../lib/rcesConnection");
/**
 * Instance de Movistar (Singleton)
 */
let movistar = movistar_1.Movistar.getInstance();
function connectRCES(socket) {
    console.log(`New connection from ${socket.remoteAddress} : ${socket.remotePort}`);
    let rcesConnection = new rcesConnection_1.RCES(socket);
    rcesConnection.setSocketMovistar(movistar.getSocket());
}
exports.connectRCES = connectRCES;
