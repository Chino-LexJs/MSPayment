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
exports.Movistar = void 0;
/**
 * Clases para distintos mensajes en formato ISO 8583
 * @module Lib
 */
const rces_1 = require("../connection/rces");
const message_controllers_1 = require("../db/message.controllers");
const request_controllers_1 = require("../db/request.controllers");
const reverse_controllers_1 = require("../db/reverse.controllers");
const util_1 = require("../util");
const _0430_1 = require("./strategy/0430");
const _0210_1 = require("./strategy/0210");
const _0420_1 = require("./strategy/0420");
const _0800_1 = require("./strategy/0800");
const _0810_1 = require("./strategy/0810");
const _8583_1 = require("./strategy/8583");
const { Socket } = require("net");
const to_MOVISTAR = {
    host: "localhost",
    port: 8000,
};
/**
 * Clase para crear Movistar
 * Se usa patron Singleton
 * Contiene la conexion socket a moviestar y el comportamiento de los msj entrantes y salientes
 */
class Movistar {
    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    constructor() {
        this.tiempoRespuesta = 55;
        this.connecting = false;
    }
    /**
     * The static method that controls the access to the singleton instance.
     *
     * This implementation let you subclass the Singleton class while keeping
     * just one instance of each subclass around.
     */
    static getInstance() {
        if (!Movistar.instance) {
            Movistar.instance = new Movistar();
        }
        return Movistar.instance;
    }
    /**
     * Establece conexion socket a Movistar
     * @returns {void}
     */
    connect() {
        if (!this.connecting) {
            this.socket = new Socket();
            this.socket.connect(to_MOVISTAR);
            this.setConnecting(true);
            this.socket.setEncoding("utf8"); // se configura socket para manejar cadena de caracteres en el buffer[]
            this.socket.on("data", (message) => this.onData(message));
            this.socket.on("close", () => {
                console.log(`\nComunicacion con MOVISTAR finalizada`);
                this.setConnecting(false);
                this.socket.destroy();
            });
            this.socket.on("error", (err) => {
                this.setConnecting(false);
                this.socket.destroy();
            });
        }
    }
    /**
     * Devuelve la conexion socket a Movistar
     * @returns {any} Socket con conexion a Movistar
     */
    getSocket() {
        return this.socket;
    }
    /**
     *
     * @param {string} PosPreauthorizationChargebackData contiene Product Number, DNB y Product Group
     * @returns {string} Product Number
     */
    getProductNr(PosPreauthorizationChargebackData) {
        return PosPreauthorizationChargebackData.substr(24, 4);
    }
    /**
     * Configura el estado de conectado, se usa cuando se desconecta o se conecta la instancia a movistar
     * @param {boolean} state estado de conectado(true) o desconectado (false)
     */
    setConnecting(state) {
        this.connecting = state;
    }
    /**
     * Funcion que sirve para enviar msj 0810 de echo a movistar
     */
    sendMessage0810() {
        return __awaiter(this, void 0, void 0, function* () {
            let dataElements_0810 = {
                TransmissionDateTime: (0, util_1.TransmissionDateTime)(),
                SystemsTraceAuditNumber: "032727",
                ResponseCode: "00",
                NetworkManagementInformationCode: "301",
            };
            let mti0810 = new _8583_1.ISO8583(new _0810_1.MTI0810());
            mti0810.setFields(dataElements_0810, "0810");
            yield (0, util_1.saveMessageDataBase)(mti0810.getMti(), mti0810.getSystemTraceAuditNumber(), mti0810.getMessage());
            console.log(`\nMensaje echo 0810 a Movistar: ${mti0810.getMessage()}`);
            this.socket.write(mti0810.getMessage(), "utf8");
        });
    }
    /**
     * Funcion que sirve para enviar msj 0420 a movistar y generar un elemento reverso en la tabla de reversos de la DB
     * @param {ISO8583} mti0210 mensaje 0210 que se usa para el armado de msj 0420
     */
    sendMessage0420(mti0210) {
        return __awaiter(this, void 0, void 0, function* () {
            let fields0420 = {};
            let fields0210 = mti0210.getFields();
            const MANDATORIO = "mandatorio";
            const VALUE = "value";
            // Los parametros que se envian en el msj 0420 son similares al 0210 por lo que se copian los valores
            for (const key in fields0210) {
                if (fields0210[key][MANDATORIO]) {
                    fields0420[key] = fields0210[key][VALUE].toString();
                }
            }
            let mti0420 = new _8583_1.ISO8583(new _0420_1.MTI0420());
            mti0420.setFields(fields0420, "0420");
            console.log("\nMensaje 0420 a Movistar en formato ISO8583:");
            console.log(mti0420.getMessage());
            console.log("\nData elements usados en el msj 0420 a Movistar: ");
            console.log(mti0420.getFields());
            this.socket.write(mti0420.getMessage(), "utf8");
            let id_mti0420 = yield (0, util_1.saveMessageDataBase)(mti0420.getMti(), mti0420.getTrancenr(), mti0420.getMessage());
            let values = {
                date: new Date(),
                time: new Date(),
                request_id: mti0210.getTrancenr(),
                isomessage420_id: id_mti0420,
                responsecode: mti0420.getResponseCode(),
                referencenr: 123,
                retries: 1,
            };
            (0, reverse_controllers_1.saveReverse)(values.date, values.time, values.request_id, values.isomessage420_id, values.responsecode, values.referencenr, values.retries).then((reverse_id) => __awaiter(this, void 0, void 0, function* () {
                yield (0, request_controllers_1.setReverse_idRequest)(mti0210.getTrancenr(), reverse_id);
            }));
        });
    }
    /**
     * Funcion que contiene la logica de negocios para los mensajes de tipo 0210 etrantes de Movistar
     * @param {string} message msj 0210 en formato iso8583
     */
    message0210(message) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("\nMensaje 0210 de MOVISTAR en formato ISO8583:");
            console.log(message);
            let newFieldes = (0, util_1.unpack_ISO)(message);
            console.log("\nData elements de msj 0210 de Movistar: ");
            console.log(newFieldes);
            let mti0210 = new _8583_1.ISO8583(new _0210_1.MTI0210());
            mti0210.setFields(newFieldes, "0210");
            yield (0, util_1.saveMessageDataBase)(mti0210.getMti(), mti0210.getTrancenr(), message);
            let newDate = new Date();
            yield (0, request_controllers_1.setResponseDataRequest)(mti0210.getTrancenr(), newDate, newDate);
            /**
             * getMessage(trancenr) busca el mensaje 0200 que se envio a Movistar
             * res es el mensaje guardado en la base de datos de tipo 0200
             */
            let message0200 = yield (0, message_controllers_1.getMessage)(mti0210.getTrancenr());
            let jsonDate = {
                year: new Date(message0200.date).getFullYear(),
                month: new Date(message0200.date).getMonth(),
                day: new Date(message0200.date).getDate(),
                hour: message0200.time.slice(0, 2),
                minutes: message0200.time.slice(3, 5),
                seconds: message0200.time.slice(6),
            };
            /**
             * difDates contiene la diferencia de tiempo en segundos entre la hora en que se envio el msj 0200 a Movistar y la hora de respuesta 0210
             */
            let difDates = Math.round((new Date().getTime() -
                new Date(jsonDate.year, jsonDate.month, jsonDate.day, jsonDate.hour, jsonDate.minutes, jsonDate.seconds).getTime()) /
                1000);
            if (difDates > this.tiempoRespuesta) {
                // se envia msj 0420 y se genera un elemento reverso en la tabla de reversos de la DB
                this.sendMessage0420(mti0210);
            }
            else {
                // se guarda msj 0210 que se envia a RCES, se genera un msj 0210 para RCES y se envia msj a RCES
                mti0210.addYearLocalTransactionDate(jsonDate.year); // Se agrega el año del request almacenado en la db
                let fields0200 = (0, util_1.unpack_ISO)(message0200.message.substr(12));
                mti0210.setProduct_NR(this.getProductNr(fields0200.PosPreauthorizationChargebackData));
                yield (0, util_1.saveMessageDataBase)(mti0210.getMti(), mti0210.getTrancenr(), mti0210.getMessage0210());
                /**
                 * Se busca entre las distintas conexiones que se establecieron con RCES y se envia la respuesta 0210 a la conexion correspondiente
                 */
                if ((0, rces_1.findConnection)(mti0210.getTrancenr())) {
                    (0, rces_1.sendMessageConnection)(mti0210.getTrancenr(), mti0210.getMessage0210());
                    console.log("\nMensaje que se envia a RCES en formato RCES");
                    console.log(mti0210.getMessage0210());
                }
                else {
                    console.log("\nNo se encontro cliente, se envia msj 0420 a Movistar");
                    this.sendMessage0420(mti0210);
                }
            }
        });
    }
    /**
     * Funcion que contiene la logica de negocios para los mensajes de tipo 0430 etrantes de Movistar
     * @param {string} message msj 0430 en formato iso8583
     */
    message0430(message) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("\nMensaje 0430 de MOVISTAR en formato ISO8583:");
            console.log(message);
            let newFieldes = (0, util_1.unpack_ISO)(message);
            console.log(newFieldes);
            let mti0430 = new _8583_1.ISO8583(new _0430_1.MTI0430());
            mti0430.setFields(newFieldes, "0430");
            yield (0, util_1.saveMessageDataBase)(mti0430.getMti(), mti0430.getTrancenr(), message);
            (0, reverse_controllers_1.getReverseByRequestId)(mti0430.getTrancenr()).then((reverses) => __awaiter(this, void 0, void 0, function* () {
                if (reverses.length != 0) {
                    reverses.forEach((reverse) => __awaiter(this, void 0, void 0, function* () {
                        if (reverse.isomessage430_id == null) {
                            let id_message0430 = yield (0, util_1.saveMessageDataBase)(mti0430.getMti(), mti0430.getTrancenr(), mti0430.getMessage());
                            yield (0, reverse_controllers_1.setIsoMessage0430)(reverse.id, id_message0430);
                        }
                    }));
                }
            }));
        });
    }
    /**
     * Funcion que contiene la logica de negocios para los mensajes de tipo 0800 etrantes de Movistar
     * @param {string} message
     */
    message0800(message) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("\nMensaje 0800 de MOVISTAR en formato ISO8583:");
            console.log(message);
            let newFieldes = (0, util_1.unpack_ISO)(message);
            console.log("\nData elements de msj 0800 de Movistar: ");
            console.log(newFieldes);
            let mti0800 = new _8583_1.ISO8583(new _0800_1.MTI0800());
            mti0800.setFields(newFieldes, "0800");
            yield (0, util_1.saveMessageDataBase)(mti0800.getMti(), mti0800.getSystemTraceAuditNumber(), message);
            this.sendMessage0810();
        });
    }
    /**
     * Funcion que sirve para recuperar el tipo de msj ISO8583
     * Precondiciones: La trama message debe tener el mti en los primeros 4 caracteres
     * @param {string} message Mensaje ISO 8583 de Movistar
     * @returns {string} mti type of message ej: 0200, 0210, 0430, 0800, 0810
     */
    getMti(message) {
        return message.substr(0, 4);
    }
    /**
     * Funcion que sirve para determinar la logica a usar dependiendo el msj entrante de Movistar
     * @param {string} message msj de movistar en formato iso8583
     */
    onData(message) {
        let mtiMessage = this.getMti(message);
        switch (mtiMessage) {
            case "0210":
                this.message0210(message);
                break;
            case "0430":
                this.message0430(message);
                break;
            case "0800":
                this.message0800(message);
            default:
                console.log("\nTipo de mensaje (MTI) no soportado por el Servidor");
                break;
        }
    }
}
exports.Movistar = Movistar;
