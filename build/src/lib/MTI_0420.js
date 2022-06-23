"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MTI0420 = void 0;
const iso8583_1 = require("../lib/iso8583");
class MTI0420 extends iso8583_1.ISO8583 {
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
    getResponseCode() {
        return Number(this.fieldsIso.ResponseCode[4]);
    }
}
exports.MTI0420 = MTI0420;
