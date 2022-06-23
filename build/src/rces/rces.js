"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRCES = void 0;
const movistar_1 = require("../connection/movistar");
const rcesConnection_1 = require("../lib/rcesConnection");
function connectRCES(socket) {
    console.log(`New connection from ${socket.remoteAddress} : ${socket.remotePort}`);
    let rcesConnection = new rcesConnection_1.RCES(socket);
    rcesConnection.setSocketMovistar(movistar_1.movistar.getSocket());
}
exports.connectRCES = connectRCES;
