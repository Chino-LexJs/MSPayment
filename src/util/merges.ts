/**
 * Distintas funciones utils del sistema
 * @module Utils
 */
import { Field } from "../lib/strategy/fields";
import { propsToFields } from "./propsToFields";

export function merge(
  mti: string,
  dataElements: { [key: string]: string },
  fields: {
    [keys: string]: Field;
  }
) {
  switch (mti) {
    case "0200":
      merge_0200(dataElements, fields);
      break;
    case "0210":
      merge_0210_0430_0800_0810(dataElements, fields);
      break;
    case "0430":
      merge_0210_0430_0800_0810(dataElements, fields);
      break;
    case "0800":
      merge_0210_0430_0800_0810(dataElements, fields);
      break;
    case "0810":
      merge_0210_0430_0800_0810(dataElements, fields);
      break;
    case "0420":
      merge_0420(dataElements, fields);
      break;
    default:
      break;
  }
}

function merge_0200(
  dataElements: { [key: string]: string },
  fields_param: {
    [keys: string]: Field;
  }
) {
  const MANDATORIO = "mandatorio",
    VALUE = "value";
  let paramsToFields: { [key: string]: string } = propsToFields(dataElements);
  for (let key in fields_param) {
    if (Object.keys(paramsToFields).includes(key)) {
      fields_param[key][MANDATORIO] = true;
      fields_param[key][VALUE] = paramsToFields[key];
    }
  }
}

function merge_0210_0430_0800_0810(
  dataElements: { [key: string]: string },
  fields: {
    [keys: string]: Field;
  }
) {
  const MANDATORIO = "mandatorio",
    VALUE = "value";
  for (let key in fields) {
    if (Object.keys(dataElements).includes(key)) {
      fields[key][MANDATORIO] = true;
      fields[key][VALUE] = dataElements[key];
    }
  }
}

function merge_0420(
  dataElements_0210: { [key: string]: string },
  fields: {
    [keys: string]: Field;
  }
) {
  const MANDATORIO = "mandatorio",
    VALUE = "value";
  for (let key in fields) {
    if (
      Object.keys(dataElements_0210).includes(key) &&
      key !== "ReceivingIntitutionIDCode"
    ) {
      fields[key][MANDATORIO] = true;
      fields[key][VALUE] = dataElements_0210[key];
    }
  }
  fields.OriginalDataElements[MANDATORIO] = true;
  fields.OriginalDataElements[VALUE] = "".concat(
    "0200", // 4 bytes
    dataElements_0210.RetrievalReferenceNumber, // 12 bytes
    dataElements_0210.LocalTransactionDate, // 4 bytes
    dataElements_0210.LocalTransactionTime.toString().padStart(8, "0"), // 8 bytes
    dataElements_0210.CaptureDate, // 4 bytes
    "".padStart(10, " ") // 10 bytes
  );
  fields.MTI[MANDATORIO] = true;
  fields.MTI[VALUE] = "0420";
}
