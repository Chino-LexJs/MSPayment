"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.server = void 0;
/**
 * Distintas funciones principales del sistema
 * @module Server
 */
const rces_1 = require("./rces/rces");
const loops_1 = require("./loop/loops");
const movistar_1 = require("./lib/movistar");
/**
 * Instance de Movistar (Singleton)
 */
let movistar = movistar_1.Movistar.getInstance();
const { Server } = require("net"), server = new Server(), TIEMPO_LOOP_REVERSE = 30000, TIEMPO_LOOP_ECHO = 60000;
exports.server = server;
/**
 * Configuracion del server para que conteste a los distintos mensajes RCES entrantes
 */
server.on("connection", (socket) => (0, rces_1.connectRCES)(socket));
/**
 * Funcion principal del sistema
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        setInterval(loops_1.loopReverses, TIEMPO_LOOP_REVERSE);
        setInterval(loops_1.loopEcho, TIEMPO_LOOP_ECHO);
        setInterval(() => movistar.connect(), 1000);
    });
}
exports.main = main;
