"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MTI0430 = void 0;
class MTI0430 {
    constructor() {
        this.mti = "0430";
        this.header = "ISO026000055";
    }
    getHeaderMessage(bitmap) {
        let msg = "";
        msg = msg.concat(this.getHeader(), this.getMti(), bitmap);
        return msg;
    }
    getMti() {
        return this.mti;
    }
    getHeader() {
        return this.header;
    }
}
exports.MTI0430 = MTI0430;
