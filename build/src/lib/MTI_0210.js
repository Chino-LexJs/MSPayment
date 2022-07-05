"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MTI0210 = void 0;
/**
 * Clases para distintos mensajes en formato ISO 8583
 * @module Lib
 */
const iso8583_1 = require("../lib/iso8583");
class MTI0210 extends iso8583_1.ISO8583 {
    constructor(dataElements, mti) {
        super(dataElements, mti);
        this.product_NR = "";
        this.header = "ISO001300055";
        this.mti = mti;
    }
    then(arg0) {
        throw new Error("Method not implemented.");
    }
    /**
     * El getMessage de la clase 0210 no retorna un string en formato ISO8583 como las demas clases
     * Este getMessage retorna una trama de forma ISO-0210-RCES
     * Ya que un msj 0210 de Movistar solo se retorna al sistema RCES y se almacena en la base de datos
     * @returns trama con formato ISO-0210-RCES
     */
    getMessage() {
        let msg = "";
        this.fieldsIso.SecundaryBitmap[4] = this.getScondaryBitmap();
        this.fieldsIso.SecundaryBitmap[3] = true;
        msg = msg.concat(String.fromCharCode(2), this.fieldsIso.AccountIdentification1[4].toString(), // Account (6)
        this.fieldsIso.CardAcceptorNameLocation[4].toString().substr(0, 10), // Pos_id (10)
        this.fieldsIso.LocalTransactionDate[4].toString(), // pos date (8)
        this.fieldsIso.LocalTransactionTime[4].toString(), // pos time (6)
        this.fieldsIso.PosPreauthorizationChargebackData[4]
            .toString()
            .substr(8, 10), // DNB (10)
        this.fieldsIso.TransactionAmount[4].toString().substr(2, 10), // Amount (10)
        this.fieldsIso.PosPreauthorizationChargebackData[4]
            .toString()
            .substr(7, 1), // Product group (1)
        this.getproduct_NR(), // PRODUCT_NR no viene de MOVISTAR PREGUNTAR POR QUE?
        "2", // 2 fijo (1)
        this.fieldsIso.ResponseCode[4].toString(), // response code (2)
        this.fieldsIso.AuthorizationIdentificationResponse[4].toString(), // Authorization NR (6)
        this.fieldsIso.RetrievalReferenceNumber[4].toString().padStart(10, "0"), // ID (10)
        "00", // ERROR si hay algun error se notifica mediante este parametro
        String.fromCharCode(3));
        return msg;
    }
    getMti() {
        return this.mti;
    }
    addYearLocalTransactionDate(year) {
        this.fieldsIso.LocalTransactionDate[4] =
            year.toString() + this.fieldsIso.LocalTransactionDate[4];
    }
    setProduct_NR(product_NR) {
        this.product_NR = product_NR;
    }
    getproduct_NR() {
        return this.product_NR ? this.product_NR : "0000";
    }
}
exports.MTI0210 = MTI0210;
