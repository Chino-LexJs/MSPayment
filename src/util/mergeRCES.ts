import { propsToFields } from "./util_propsToFields";

export function merge_0200(
  dataElements: { [key: string]: string },
  fields_param: {
    [keys: string]: (string | number | boolean)[];
  }
) {
  const MANDATORIO = 3,
    INFO = 4;
  let paramsToFields: { [key: string]: string } = propsToFields(dataElements);
  for (let key in fields_param) {
    if (Object.keys(paramsToFields).includes(key)) {
      fields_param[key][MANDATORIO] = true;
      fields_param[key][INFO] = paramsToFields[key];
    }
  }
}

export function merge_0210_0430(
  dataElements: { [key: string]: string },
  fields: {
    [keys: string]: (string | number | boolean)[];
  }
) {
  const MANDATORIO = 3,
    INFO = 4;
  for (let key in fields) {
    if (Object.keys(dataElements).includes(key)) {
      fields[key][MANDATORIO] = true;
      fields[key][INFO] = dataElements[key];
    }
  }
}

export function merge_0420(
  dataElements_0210: { [key: string]: string },
  fields: {
    [keys: string]: (string | number | boolean)[];
  }
) {
  const MANDATORIO = 3,
    INFO = 4;
  for (let key in fields) {
    if (
      Object.keys(dataElements_0210).includes(key) &&
      key !== "ReceivingIntitutionIDCode"
    ) {
      fields[key][MANDATORIO] = true;
      fields[key][INFO] = dataElements_0210[key];
    }
  }
  fields.OriginalDataElements[MANDATORIO] = true;
  fields.OriginalDataElements[INFO] = "".concat(
    "0200", // 4 bytes
    dataElements_0210.RetrievalReferenceNumber, // 12 bytes
    dataElements_0210.LocalTransactionDate, // 4 bytes
    dataElements_0210.LocalTransactionTime.toString().padStart(8, "0"), // 8 bytes
    dataElements_0210.CaptureDate, // 4 bytes
    "".padStart(10, " ") // 10 bytes
  );
}
