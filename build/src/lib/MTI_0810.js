"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MTI0810 = void 0;
/**
 * Clases para distintos mensajes en formato ISO 8583
 * @module Lib
 */
const MTI_0800_1 = require("./MTI_0800");
class MTI0810 extends MTI_0800_1.MTI0800 {
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
exports.MTI0810 = MTI0810;
