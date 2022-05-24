import { propsToFields } from "./util_propsToFields";

export function mergeRCES(
  dataElements: { [key: string]: string },
  fields_param: {
    [keys: string]: (string | number | boolean)[];
  }
) {
  const MANDATORIO = 3,
    INFO = 4;
  dataElements.SYSTEMS_TRANCE = "000056"; // Esto es el ID de folio de la base de datos
  let paramsToFields: { [key: string]: string } = propsToFields(dataElements);
  for (let key in fields_param) {
    if (Object.keys(paramsToFields).includes(key)) {
      fields_param[key][MANDATORIO] = true;
      fields_param[key][INFO] = paramsToFields[key];
    }
  }
}

export function mergeRCES_0210(
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
