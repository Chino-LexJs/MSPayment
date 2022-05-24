function transactionDateTime(
  date: string,
  time: string
): {
  [key: string]: string;
} {
  let dateTime = {
    date: "",
    time: "",
  };
  let formatDate = `${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(
    6,
    2
  )} ${time.substr(0, 2)}:${time.substr(2, 2)}:${time.substr(4, 2)}`;
  let newDate = new Date(Date.parse(formatDate));
  let LocalTransactionTime = "",
    LocalTransactionDate = "";

  let day =
    newDate.getDate() < 10
      ? `0${newDate.getDate().toString()}`
      : newDate.getDate().toString();
  let month =
    newDate.getMonth() < 10
      ? `0${newDate.getMonth() + 1}`
      : `${newDate.getMonth() + 1}`;

  dateTime.date = LocalTransactionDate.concat(month, day);
  dateTime.time = LocalTransactionTime.concat(
    newDate.getHours().toString(),
    newDate.getMinutes().toString(),
    newDate.getSeconds().toString()
  );
  return dateTime;
}
function amount(amountMessage: string): string {
  if (amountMessage.length === 12) {
    return amountMessage;
  } else {
    while (amountMessage.length < 12) {
      amountMessage = "0" + amountMessage;
    }
    return amountMessage;
  }
}
function systemsTrace(systemsTraceNumber: string): string {
  if (systemsTraceNumber.length === 6) {
    return systemsTraceNumber;
  } else {
    while (systemsTraceNumber.length < 6) {
      systemsTraceNumber = "0" + systemsTraceNumber;
    }
    return systemsTraceNumber;
  }
}
function TransmissionDateTime(): string {
  let day = new Date(),
    MM = day.getMonth().toString().padStart(2, "0"),
    DD = day.getDate().toString().padStart(2, "0"),
    hh = day.getHours().toString().padStart(2, "0"),
    mm = day.getMinutes().toString().padStart(2, "0"),
    ss = day.getSeconds().toString().padStart(2, "0");
  return "".concat(MM, DD, hh, ss);
}
function SettlementDate(): string {
  let date = new Date(),
    MM = date.getMonth().toString().padStart(2, "0"),
    DD = date.getDate().toString().padStart(2, "0");
  return "".concat(MM, DD);
}
function additionalData(
  productNr: string,
  dnb: string,
  productGroup: string
): string {
  if (productNr === "0000") {
    return "067MOVI" + productGroup + dnb + "^C".padStart(6, " ");
  } else {
    return "067MOVI" + productGroup + dnb + productNr + "^C".padStart(6, " ");
  }
}
export function propsToFields(dataElements: { [key: string]: string }): {
  [key: string]: string;
} {
  let dateTime = transactionDateTime(
    dataElements.POS_DATE,
    dataElements.POS_TIME
  );
  let messageUnpack = {
    ProcessingCode: dataElements.PROCESSING_CODE,
    TransactionAmount: amount(dataElements.AMOUNT.split(".").join("")),
    TransmissionDateTime: TransmissionDateTime(),
    SystemsTraceAuditNumber: systemsTrace(dataElements.SYSTEMS_TRANCE),
    LocalTransactionTime: dateTime.time,
    LocalTransactionDate: dateTime.date,
    SettlementDate: SettlementDate(), // REVISAR
    CaptureDate: SettlementDate(), // REVISAR
    AcquiringInstitutionIdentificationCode: "03917",
    Track2Data: "170000000000000000=",
    RetrievalReferenceNumber: "".padStart(12, "0A"), // PROVIENE DE LA BASE DA DATOS
    CardAcceptorTerminalID: "TARE%.6d        ",
    CardAcceptorNameLocation: "".concat(
      dataElements.POS_NAME,
      dataElements.POS_ID,
      dataElements.POS_STATE,
      "MX" // POS COUNTRY
    ),
    RetailerData: "044A00000000000           300   48400000000000",
    TransactionCurrencyCode: "484",
    TerminalData: "012B917PRO1-%.3d",
    CardIssuerCaterogyResponseCodeData: "013            P",
    ReceivingIntitutionIDCode: "03917",
    AccountIdentification1:
      dataElements.ACCOUNT_ID.length.toString().padStart(2, "0") +
      dataElements.ACCOUNT_ID,
    PosPreauthorizationChargebackData: additionalData(
      dataElements.PRODUCT_NR,
      dataElements.DNB,
      dataElements.PRODUCT_GROUP
    ),
  };
  return messageUnpack;
}
export function propsToFields_0210(dataElements: { [key: string]: string }): {
  [key: string]: string;
} {
  let dateTime = transactionDateTime(
    dataElements.POS_DATE,
    dataElements.POS_TIME
  );
  let messageUnpack = {
    ProcessingCode: dataElements.PROCESSING_CODE,
    TransactionAmount: amount(dataElements.AMOUNT.split(".").join("")),
    TransmissionDateTime: TransmissionDateTime(),
    SystemsTraceAuditNumber: systemsTrace(dataElements.SYSTEMS_TRANCE),
    LocalTransactionTime: dateTime.time,
    LocalTransactionDate: dateTime.date,
    SettlementDate: SettlementDate(), // REVISAR
    CaptureDate: SettlementDate(), // REVISAR
    AcquiringInstitutionIdentificationCode: "03917".padStart(11),
    Track2Data: "170000000000000000=".padStart(37),
    RetrievalReferenceNumber: "".padStart(12, "0A"), // PROVIENE DE LA BASE DA DATOS
    CardAcceptorTerminalID: "TARE%.6d        ",
    CardAcceptorNameLocation: "".concat(
      dataElements.POS_NAME,
      dataElements.POS_ID,
      dataElements.POS_STATE,
      "MX" // POS COUNTRY
    ),
    RetailerData: "044A00000000000           300   48400000000000",
    TransactionCurrencyCode: "484",
    TerminalData: "012B917PRO1-%.3d",
    CardIssuerCaterogyResponseCodeData: "013            P",
    ReceivingIntitutionIDCode: "03917      ", // se relleno con espacios para tener long de 11
    AccountIdentification1: dataElements.ACCOUNT_ID.toString().padStart(
      12,
      "0"
    ), // se relleno con espacios para tener long de 12,
    PosPreauthorizationChargebackData: "                    ", // se relleno con espacios para tener long de 20
  };
  return messageUnpack;
}
