import { util_hexa_bin_Bitmap, hex2bin } from "../util/util_hexa_bin";

let fields: {
  [keys: string]: (string | number | boolean)[];
} = {
  MTI: [0, "n", 4, false, "info"],
  SecundaryBitmap: [1, "an", 16, false, "info"],
  ProcessingCode: [3, "n", 6, false, "info"], // recarga code: “650500”
  TransactionAmount: [4, "n", 12, false, "info"],
  TransmissionDateTime: [7, "n", 10, false, "info"],
  SystemsTraceAuditNumber: [11, "n", 6, false, "info"],
  LocalTransactionTime: [12, "n", 6, false, "info"],
  LocalTransactionDate: [13, "n", 4, false, "info"],
  SettlementDate: [15, "n", 4, false, "info"],
  CaptureDate: [17, "n", 4, false, "info"],
  AcquiringInstitutionIdentificationCode: [32, "n", 11, false, "info"], // Este campo debe der asignado por Telefónica Movistar Valor fijo del campo “03XXX”
  Track2Data: [35, "ans", 37, false, "info"],
  RetrievalReferenceNumber: [37, "arn", 12, false, "info"],
  AuthorizationIdentificationResponse: [38, "an", 6, false, "info"],
  ResponseCode: [39, "an", 2, false, "info"],
  CardAcceptorTerminalID: [41, "ans", 16, false, "info"],
  CardAcceptorNameLocation: [43, "ans", 40, false, "info"],
  RetailerData: [48, "ans", 47, false, "info"], // antes long de 30
  TransactionCurrencyCode: [49, "n", 3, false, "info"],
  TerminalData: [60, "ans", 15, false, "info"], // antes long de 19
  CardIssuerCaterogyResponseCodeData: [61, "ans", 16, false, "info"], // antes long de 22
  ReceivingIntitutionIDCode: [100, "n", 11, false, "info"],
  AccountIdentification1: [102, "ans", 12, false, "info"], // antes long de 28
  PosPreauthorizationChargebackData: [126, "ans", 100, false, "info"], // long real 100, se usa 20 para pureba
};
export function util_unpack(message: string): { [key: string]: string } {
  const unpack = {
    ACTION: message.substr(3, 1), // 0
    ACCOUNT_ID: message.substr(2, 6),
    POS_ID: message.substr(9, 10),
    POS_NAME: message.substr(19, 22),
    POS_STATE: message.substr(41, 3),
    POS_TIME_ZONE: message.substr(44, 3), // 000
    POS_DATE: message.substr(47, 8),
    POS_TIME: message.substr(55, 6),
    DNB: message.substr(61, 10),
    PROCESSING_CODE: message.substr(71, 6),
    AMOUNT: message.substr(77, 10),
    PRODUCT_GROUP: message.substr(87, 1),
    PRODUCT_NR: message.substr(88, 4),
    RESPONSE_CODE: "99",
    AUTORIZATION_NR: "-1",
  };

  return unpack;
}

export function util_unpack_0210(message: string): { [key: string]: string } {
  let newFields: { [key: string]: string } = {};
  newFields.MTI = message.substr(0, 4);
  let primaryBitmap = message.substr(4, 16);
  console.log("Primary bitmap");
  console.log(primaryBitmap);
  let arrayOfCampos = [];
  let array = hex2bin(primaryBitmap);
  for (let i = 0; i < array.length; i++) {
    if (array[i] === "1") {
      arrayOfCampos.push(i + 1);
    }
  }
  if (array[0] === "1") {
    array = hex2bin(message.substr(20, 16)); // secondary bit map.
    for (let i = 0; i < array.length; i++) {
      if (array[i] === "1") {
        arrayOfCampos.push(i + 65);
      }
    }
  }
  console.log(arrayOfCampos);
  let init = 20;
  for (const key in fields) {
    if (arrayOfCampos.includes(Number(fields[key][0]))) {
      let longitud: number = longitudParam(key, message, init);
      newFields[key] = message.substr(init, Number(longitud));
      init += Number(longitud);
    }
  }
  console.log(newFields);
  return newFields;
}

function longitudParam(key: string, message: string, init: number): number {
  switch (key) {
    case "AcquiringInstitutionIdentificationCode":
      return Number(message.substr(init, 2)) + 2;
    case "Track2Data":
      return Number(message.substr(init, 2)) + 2;
    case "CardIssuerCaterogyResponseCodeData":
      return Number(message.substr(init, 3)) + 3;
    case "ReceivingIntitutionIDCode":
      return Number(message.substr(init, 2)) + 2;
    case "AccountIdentification1":
      return Number(message.substr(init, 2)) + 2;
    case "PosPreauthorizationChargebackData":
      return Number(message.substr(init, 3)) + 3;
    default:
      return Number(fields[key][2]);
  }
}
