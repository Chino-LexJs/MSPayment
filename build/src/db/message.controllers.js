"use strict";
/**
 * Base de datos
 * @module DataBase
 */
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
exports.saveMessage = exports.getMessageById = exports.getMessage = void 0;
const db_1 = require("./db");
/**
 *
 * @param tracenr es el System Trace Audit Number (P-11) y Retrieval Reference Number (P-37)
 * @returns Devuelve el mensaje de la base de datos con el trancenr = {trancenr} enviado por parametro
 */
function getMessage(tracenr) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let res = yield db_1.pool.query(`SELECT * FROM message WHERE tracenr = ${tracenr}`);
            return res[0][0];
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.getMessage = getMessage;
function getMessageById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let res = yield db_1.pool.query(`SELECT * FROM message WHERE id = ${id}`);
            return res[0][0];
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.getMessageById = getMessageById;
function saveMessage(date, time, type, messagedate, messagetime, tracenr, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let res = yield db_1.pool.query("INSERT INTO message (date, time, type, messagedate, messagetime, tracenr, message) VALUES (?,?,?,?,?,?,?)", [date, time, type, messagedate, messagetime, tracenr, message]);
            return res[0].insertId;
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.saveMessage = saveMessage;
