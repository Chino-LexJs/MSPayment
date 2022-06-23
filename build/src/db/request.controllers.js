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
exports.setReverse_idRequest = exports.setResponseDataRequest = exports.saveRequest = exports.getRequestById = void 0;
const db_1 = require("./db");
function getRequestById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let res = yield db_1.pool.query(`SELECT * FROM request WHERE id = ${id}`);
            return res[0];
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.getRequestById = getRequestById;
function saveRequest(date_request, time_request, ip, account_id, pos_id, pos_name, pos_state, postimezona, posdate, postime, dnb, amount, productgroup, product_nr, responsecode, authorizationnr, error, action) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let res = yield db_1.pool.query("INSERT INTO request (date_request, time_request, ip, account_id, pos_id, pos_name, pos_state, postimezona, posdate, postime, dnb, amount, productgroup, product_nr, responsecode, authorizationnr, error, action) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
                date_request,
                time_request,
                ip,
                account_id,
                pos_id,
                pos_name,
                pos_state,
                postimezona,
                posdate,
                postime,
                dnb,
                amount,
                productgroup,
                product_nr,
                responsecode,
                authorizationnr,
                error,
                action,
            ]);
            return res[0].insertId;
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.saveRequest = saveRequest;
function setResponseDataRequest(request_id, responsedate, responsetime) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let res = yield db_1.pool.query(`UPDATE request SET responsedate = ?, responsetime = ? WHERE id=${request_id};`, [responsedate, responsetime]);
            return res[0];
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.setResponseDataRequest = setResponseDataRequest;
function setReverse_idRequest(request_id, reverse_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let res = yield db_1.pool.query(`UPDATE request SET reverse_id = ? WHERE id=${request_id};`, [reverse_id]);
            return res[0];
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.setReverse_idRequest = setReverse_idRequest;
