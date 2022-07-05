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
/**
 * Distintas funciones principales del sistema
 * @module Server
 */
const app_1 = require("./app");
/**
 * Numero de puerto del server
 * @type {number}
 */
const port = 3000, 
/**
 * Host del servidor
 * @type {string}
 */
host = "0.0.0.0";
/**
 * Inicia el servidor
 */
app_1.server.listen({ port, host }, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server on port: ${app_1.server.address().port}`);
    (0, app_1.main)();
}));
