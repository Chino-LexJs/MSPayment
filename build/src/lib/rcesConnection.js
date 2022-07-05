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
exports.RCES = void 0;
/**
 * Clases para distintos mensajes en formato ISO 8583
 * @module Lib
 */
const _0200_1 = require("./strategy/0200");
const _8583_1 = require("./strategy/8583");
const rces_1 = require("../connection/rces");
const request_controllers_1 = require("../db/request.controllers");
const util_1 = require("../util");
class RCES {
    constructor(socket) {
        this.TIEMPO_CONEXION_RCES = 55000;
        this.socket = socket;
        this.socket.setEncoding("utf8"); // se configura socket para manejar cadena de caracteres en el buffer[]
        this.socket.on("data", (message) => __awaiter(this, void 0, void 0, function* () {
            console.log("\nMensaje de RCES sin formato: ");
            console.log(message);
            let id_request = yield this.messageFromRCES(message, this.socket.remoteAddress);
            (0, rces_1.saveConnection)(id_request, socket);
        }));
        this.socket.on("close", () => {
            (0, rces_1.closeConnection)(this.socket);
            console.log(`\nComunicacion finalizada con RCS`);
        });
        this.socket.on("error", function (err) {
            console.log(`Error: ${err}`);
        });
        this.socket.setTimeout(this.TIEMPO_CONEXION_RCES); // Tiempo limite de conexión
        this.socket.on("timeout", () => {
            console.log("Connexion socket con RCES timeout");
            this.socket.end();
        });
    }
    getSocket() {
        return this.socket;
    }
    setSocketMovistar(socket) {
        this.socketMovistar = socket;
    }
    messageFromRCES(message, ipClient) {
        return __awaiter(this, void 0, void 0, function* () {
            let dataUnpack = (0, util_1.unpack)(message);
            console.log("\nMensage de RCES deslozado: ");
            console.log(dataUnpack);
            let id_request = yield this.saveRequestMessage(dataUnpack, ipClient);
            this.addIdRquest(dataUnpack, id_request);
            let mti0200 = new _8583_1.ISO8583(new _0200_1.MTI0200());
            mti0200.setFields(dataUnpack, "0200");
            console.log("\nData elements generados por el msj 0200 de RCES:");
            console.log(mti0200.getFields());
            console.log("\nMensaje 0200 en formato ISO8583 enviado a Movistar:");
            console.log(mti0200.getMessage());
            this.socketMovistar.write(mti0200.getMessage(), "utf8");
            yield (0, util_1.saveMessageDataBase)(mti0200.getMti(), mti0200.getTrancenr(), mti0200.getMessage());
            return id_request;
        });
    }
    posDate(date) {
        return new Date(Number(date.substr(0, 4)), Number(date.substr(4, 2)), Number(date.substr(6)));
    }
    posTime(date, time) {
        return new Date(Number(date.substr(0, 4)), Number(date.substr(4, 2)), Number(date.substr(6)), Number(time.substr(0, 2)), Number(time.substr(2, 2)), Number(time.substr(4)));
    }
    saveRequestMessage(dataUnpack, ipClient) {
        return __awaiter(this, void 0, void 0, function* () {
            let posdate = this.posDate(dataUnpack.POS_DATE);
            let postime = this.posTime(dataUnpack.POS_DATE, dataUnpack.POS_TIME);
            let valuesRequest = {
                date_request: new Date(),
                time_request: new Date(),
                ip: ipClient,
                account_id: Number(dataUnpack.ACCOUNT_ID),
                pos_id: Number(dataUnpack.POS_ID),
                pos_name: dataUnpack.POS_NAME,
                pos_state: dataUnpack.POS_STATE,
                postimezona: Number(dataUnpack.POS_TIME_ZONE),
                posdate,
                postime,
                dnb: dataUnpack.DNB,
                amount: Number(dataUnpack.AMOUNT),
                productgroup: dataUnpack.PRODUCT_GROUP,
                product_nr: Number(dataUnpack.PRODUCT_NR),
                responsecode: Number(dataUnpack.RESPONSE_CODE),
                authorizationnr: Number(dataUnpack.AUTORIZATION_NR),
                error: 0,
                action: Number(dataUnpack.ACTION),
            };
            let id_request = yield (0, request_controllers_1.saveRequest)(valuesRequest.date_request, valuesRequest.time_request, valuesRequest.ip, valuesRequest.account_id, valuesRequest.pos_id, valuesRequest.pos_name, valuesRequest.pos_state, valuesRequest.postimezona, valuesRequest.posdate, valuesRequest.postime, valuesRequest.dnb, valuesRequest.amount, valuesRequest.productgroup, valuesRequest.product_nr, valuesRequest.responsecode, valuesRequest.authorizationnr, valuesRequest.error, valuesRequest.action);
            return id_request;
        });
    }
    addIdRquest(dataUnpack, id_request) {
        dataUnpack.SYSTEMS_TRANCE = id_request.toString().slice(-6); // Si el numero supera los 6 digitos P-11 solo capta hasta 6 digitos
        dataUnpack.RETRIEVAL_REFERENCE_NUMBER = id_request.toString();
    }
}
exports.RCES = RCES;
