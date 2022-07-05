"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISO8583 = void 0;
const hexa_bin_1 = require("../../util/hexa_bin");
const merges_1 = require("../../util/merges");
const fields_1 = require("./fields");
/**
 * The Context defines the interface of interest to clients.
 */
class ISO8583 {
    /**
     * Usually, the Context accepts a mti through the constructor, but also
     * provides a setter to change it at runtime.
     */
    constructor(mti) {
        this.fieldsIso = fields_1.fields;
        this.bitmap = "";
        this.secondaryBitmap = "";
        this.product_NR = "";
        this.mti = mti;
    }
    /**
     * Usually, the Context allows replacing a mti object at runtime.
     */
    setMti(mti) {
        this.mti = mti;
    }
    setFields(dataElements, mti) {
        (0, merges_1.merge)(mti, dataElements, this.fieldsIso);
    }
    getFields() {
        return this.fieldsIso;
    }
    getBitmap() {
        let DEs = (0, hexa_bin_1.numberOfDataElements)(this.fieldsIso);
        let json_bitmap = (0, hexa_bin_1.hexa_bin_Bitmap)(DEs);
        this.bitmap = json_bitmap.hexaPB;
        return this.bitmap;
    }
    getScondaryBitmap() {
        let DEs = (0, hexa_bin_1.numberOfDataElements)(this.fieldsIso);
        let json_bitmap = (0, hexa_bin_1.hexa_bin_Bitmap)(DEs);
        this.secondaryBitmap = json_bitmap.hexaSB;
        return this.secondaryBitmap;
    }
    getTrancenr() {
        return Number(this.fieldsIso["RetrievalReferenceNumber"]["value"]);
    }
    /**
     * The Context delegates some work to the mti object instead of
     * implementing multiple versions of the algorithm on its own.
     */
    getMessage() {
        let msg = "";
        this.fieldsIso.SecundaryBitmap["value"] = this.getScondaryBitmap();
        this.fieldsIso.SecundaryBitmap["mandatorio"] = true;
        msg = this.mti.getHeaderMessage(this.getBitmap());
        const keys = Object.keys(this.fieldsIso);
        for (let i = 0; i < keys.length; i++) {
            if (this.fieldsIso[keys[i]]["mandatorio"]) {
                msg = msg.concat(this.fieldsIso[keys[i]]["value"].toString());
            }
        }
        return msg;
    }
    getMessage0210() {
        let msg = "";
        msg = msg.concat(String.fromCharCode(2), fields_1.fields["AccountIdentification1"]["value"].toString(), // Account (6)
        fields_1.fields["CardAcceptorNameLocation"]["value"].toString().substr(0, 10), // Pos_id (10)
        fields_1.fields["LocalTransactionDate"]["value"].toString(), // pos date (8)
        fields_1.fields["LocalTransactionTime"]["value"].toString(), // pos time (6)
        fields_1.fields["PosPreauthorizationChargebackData"]["value"]
            .toString()
            .substr(8, 10), // DNB (10)
        fields_1.fields["TransactionAmount"]["value"].toString().substr(2, 10), // Amount (10)
        fields_1.fields["PosPreauthorizationChargebackData"]["value"]
            .toString()
            .substr(7, 1), // Product group (1)
        this.getproduct_NR(), // PRODUCT_NR no viene de MOVISTAR PREGUNTAR POR QUE?
        "2", // 2 fijo (1)
        fields_1.fields["ResponseCode"]["value"].toString(), // response code (2)
        fields_1.fields["AuthorizationIdentificationResponse"]["value"].toString(), // Authorization NR (6)
        fields_1.fields["RetrievalReferenceNumber"]["value"].toString().padStart(10, "0"), // ID (10)
        "00", // ERROR si hay algun error se notifica mediante este parametro
        String.fromCharCode(3));
        return msg;
    }
    setProduct_NR(product_NR) {
        this.product_NR = product_NR;
    }
    getproduct_NR() {
        return this.product_NR ? this.product_NR : "0000";
    }
    getResponseCode() {
        return Number(this.fieldsIso["ResponseCode"]["value"]);
    }
    addYearLocalTransactionDate(year) {
        this.fieldsIso.LocalTransactionDate["value"] =
            year.toString() + this.fieldsIso.LocalTransactionDate["value"];
    }
    getSystemTraceAuditNumber() {
        return Number(this.fieldsIso["SystemsTraceAuditNumber"]["value"]);
    }
    getMti() {
        return this.mti.getMti();
    }
}
exports.ISO8583 = ISO8583;
