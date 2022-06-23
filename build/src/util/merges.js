"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.merge_0420 = exports.merge_0210_0430_0800_0810 = exports.merge_0200 = void 0;
const propsToFields_1 = require("./propsToFields");
function merge_0200(dataElements, fields_param) {
    const MANDATORIO = 3, INFO = 4;
    let paramsToFields = (0, propsToFields_1.propsToFields)(dataElements);
    for (let key in fields_param) {
        if (Object.keys(paramsToFields).includes(key)) {
            fields_param[key][MANDATORIO] = true;
            fields_param[key][INFO] = paramsToFields[key];
        }
    }
}
exports.merge_0200 = merge_0200;
function merge_0210_0430_0800_0810(dataElements, fields) {
    const MANDATORIO = 3, INFO = 4;
    for (let key in fields) {
        if (Object.keys(dataElements).includes(key)) {
            fields[key][MANDATORIO] = true;
            fields[key][INFO] = dataElements[key];
        }
    }
}
exports.merge_0210_0430_0800_0810 = merge_0210_0430_0800_0810;
function merge_0420(dataElements_0210, fields) {
    const MANDATORIO = 3, INFO = 4;
    for (let key in fields) {
        if (Object.keys(dataElements_0210).includes(key) &&
            key !== "ReceivingIntitutionIDCode") {
            fields[key][MANDATORIO] = true;
            fields[key][INFO] = dataElements_0210[key];
        }
    }
    fields.OriginalDataElements[MANDATORIO] = true;
    fields.OriginalDataElements[INFO] = "".concat("0200", // 4 bytes
    dataElements_0210.RetrievalReferenceNumber, // 12 bytes
    dataElements_0210.LocalTransactionDate, // 4 bytes
    dataElements_0210.LocalTransactionTime.toString().padStart(8, "0"), // 8 bytes
    dataElements_0210.CaptureDate, // 4 bytes
    "".padStart(10, " ") // 10 bytes
    );
    fields.MTI[MANDATORIO] = true;
    fields.MTI[INFO] = "0420";
}
exports.merge_0420 = merge_0420;
