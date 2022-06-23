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
exports.loopReverses = exports.loopEcho = void 0;
const movistar_1 = require("../connection/movistar");
const reverse_controllers_1 = require("../db/reverse.controllers");
const lib_1 = require("../lib");
const util_1 = require("../util");
const saveMessage_1 = require("../util/saveMessage");
const reverseMessage_1 = require("./reverseMessage");
function loopReverses() {
    return __awaiter(this, void 0, void 0, function* () {
        let reverses = yield (0, reverse_controllers_1.getReverses)(); // mensajes reversos con isomessage430_id IS NULL [{reverse1}, {reverse2}...]
        console.log(`\nBuscando Reverses...\nSe encontraron: ${reverses.length} mensajes reversos sin respuesta 0430`);
        (0, reverseMessage_1.sendReverseMessages)(reverses);
    });
}
exports.loopReverses = loopReverses;
function loopEcho() {
    return __awaiter(this, void 0, void 0, function* () {
        let dataElements_0800 = {
            TransmissionDateTime: (0, util_1.TransmissionDateTime)(),
            SystemsTraceAuditNumber: "032727",
            NetworkManagementInformationCode: "301",
        };
        let mti0800 = new lib_1.MTI0800(dataElements_0800, "0800");
        yield (0, saveMessage_1.saveMessageDataBase)(mti0800.getMti(), mti0800.getSystemTraceAuditNumber(), mti0800.getMessage());
        console.log(`\nMensaje echo 0800 a Movistar: ${mti0800.getMessage()}`);
        movistar_1.movistar.getSocket().write(mti0800.getMessage(), "utf8");
    });
}
exports.loopEcho = loopEcho;
