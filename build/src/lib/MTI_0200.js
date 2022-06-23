"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MTI0200 = void 0;
const iso8583_1 = require("../lib/iso8583");
class MTI0200 extends iso8583_1.ISO8583 {
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
}
exports.MTI0200 = MTI0200;
