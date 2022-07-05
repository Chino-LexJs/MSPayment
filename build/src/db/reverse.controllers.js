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
exports.setIsoMessage0430 = exports.saveReverse = exports.getReverses = exports.getReverseByRequestId = exports.addRetrie = void 0;
/**
 * Base de datos
 * @module DataBase
 */
const db_1 = require("./db");
function addRetrie(reverse_id, cantRetries) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let res = yield db_1.pool.query(`UPDATE reverse SET retries = ${cantRetries} WHERE id=${reverse_id};`);
            return res[0];
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.addRetrie = addRetrie;
function getReverseByRequestId(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let res = yield db_1.pool.query(`SELECT * FROM reverse WHERE request_id = ${id}`);
            return res[0];
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.getReverseByRequestId = getReverseByRequestId;
function getReverses() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let res = yield db_1.pool.query(`SELECT * FROM reverse WHERE isomessage430_id IS NULL`);
            return res[0];
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.getReverses = getReverses;
function saveReverse(date, time, request_id, isomessage420_id, responsecode, referencenr, retries) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let res = yield db_1.pool.query("INSERT INTO reverse (date, time, request_id, isomessage420_id, responsecode, referencenr, retries) VALUES (?,?,?,?,?,?,?)", [
                date,
                time,
                request_id,
                isomessage420_id,
                responsecode,
                referencenr,
                retries,
            ]);
            return res[0].insertId;
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.saveReverse = saveReverse;
function setIsoMessage0430(reverse_id, id_message0430) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let res = yield db_1.pool.query(`UPDATE reverse SET isomessage430_id = ${id_message0430} WHERE id=${reverse_id};`);
            return res[0];
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.setIsoMessage0430 = setIsoMessage0430;
