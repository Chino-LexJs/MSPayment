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
exports.saveMessageDataBase = void 0;
/**
 * Distintas funciones utils del sistema
 * @module Utils
 */
const message_controllers_1 = require("../db/message.controllers");
function saveMessageDataBase(type, trancenr, message) {
    return __awaiter(this, void 0, void 0, function* () {
        let valuesMessage = {
            date: new Date(),
            time: new Date(),
            type: Number(type),
            messagedate: new Date(),
            messagetime: new Date(),
            tracenr: Number(trancenr),
            message: message,
        };
        let id_message = yield (0, message_controllers_1.saveMessage)(valuesMessage.date, valuesMessage.time, valuesMessage.type, valuesMessage.messagedate, valuesMessage.messagetime, valuesMessage.tracenr, valuesMessage.message);
        return id_message;
    });
}
exports.saveMessageDataBase = saveMessageDataBase;
