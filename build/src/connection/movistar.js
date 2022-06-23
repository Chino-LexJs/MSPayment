"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movistar = void 0;
const movistar_1 = require("../lib/movistar");
let movistar;
exports.movistar = movistar;
let socketMovistar;
try {
    exports.movistar = movistar = new movistar_1.Movistar();
}
catch (error) {
    console.log("ENTRAMOS ACA NO SE QUE ONDA");
}
