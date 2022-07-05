"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MTI0430 = void 0;
/**
 * Clases para distintos mensajes en formato ISO 8583
 * @module Lib
 */
const MTI_0420_1 = require("./MTI_0420");
class MTI0430 extends MTI_0420_1.MTI0420 {
    then(arg0) {
        throw new Error("Method not implemented.");
    }
    constructor(dataElements, mti) {
        super(dataElements, mti);
        this.header = "ISO026000055";
        this.mti = mti;
    }
    getMti() {
        return this.mti;
    }
}
exports.MTI0430 = MTI0430;
