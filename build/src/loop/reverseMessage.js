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
exports.sendReverseMessages = void 0;
const movistar_1 = require("../connection/movistar");
const message_controllers_1 = require("../db/message.controllers");
const reverse_controllers_1 = require("../db/reverse.controllers");
const util_1 = require("../util");
function sendReverseMessages(reverses) {
    reverses.forEach((reverse) => __awaiter(this, void 0, void 0, function* () {
        let mti0420 = yield (0, message_controllers_1.getMessageById)(Number(reverse.isomessage420_id));
        console.log("\nMensaje 0420 a Movistar:");
        console.log(mti0420.message.toString());
        console.log((0, util_1.unpack_ISO)(mti0420.message));
        movistar_1.movistar.getSocket().write(mti0420.message.toString(), "utf8");
        yield (0, reverse_controllers_1.addRetrie)(Number(reverse.id), Number(reverse.retries) + 1);
    }));
}
exports.sendReverseMessages = sendReverseMessages;
