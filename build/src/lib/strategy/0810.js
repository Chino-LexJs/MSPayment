"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MTI0810 = void 0;
class MTI0810 {
    constructor() {
        this.mti = "0810";
        this.header = "ISO001300055";
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
exports.MTI0810 = MTI0810;
