"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MTI0800 = void 0;
/**
 * Clases para distintos mensajes en formato ISO 8583
 * @module Lib
 */
const iso8583_1 = require("../lib/iso8583");
class MTI0800 extends iso8583_1.ISO8583 {
    then(arg0) {
        throw new Error("Method not implemented.");
    }
    constructor(dataElements, mti) {
        super(dataElements, mti);
        this.header = "ISO001300055";
        this.mti = mti;
    }
    getMti() {
        return this.mti;
    }
    getSystemTraceAuditNumber() {
        return Number(this.fieldsIso.SystemsTraceAuditNumber[4]);
    }
}
exports.MTI0800 = MTI0800;
