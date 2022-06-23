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
const movistar_1 = require("./connection/movistar");
const rces_1 = require("./rces/rces");
const loops_1 = require("./loop/loops");
const { Server } = require("net"), server = new Server(), TIEMPO_LOOP_REVERSE = 30000, // Tiempo (milisegundos) para que el sistema busque y envie reversos
TIEMPO_LOOP_ECHO = 60000;
exports.server = server;
// Configuracón del Server para distintas conexiones sockets de RCES
server.on("connection", (socket) => (0, rces_1.connectRCES)(socket));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        setInterval(loops_1.loopReverses, TIEMPO_LOOP_REVERSE);
        setInterval(loops_1.loopEcho, TIEMPO_LOOP_ECHO);
        setInterval(() => movistar_1.movistar.connect(), 1000);
    });
}
exports.main = main;
