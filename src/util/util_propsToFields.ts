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
export function TransmissionDateTime(): string {
  let day = new Date(),
    MM = (day.getMonth() + 1).toString().padStart(2, "0"),
    DD = day.getDate().toString().padStart(2, "0"),
    hh = day.getHours().toString().padStart(2, "0"),
    mm = day.getMinutes().toString().padStart(2, "0"),
    ss = day.getSeconds().toString().padStart(2, "0");
  return "".concat(MM, DD, hh, mm, ss);
}
function SettlementDate(): string {
  let date = new Date(),
    MM = (date.getMonth() + 1).toString().padStart(2, "0"),
    DD = date.getDate().toString().padStart(2, "0");
  return "".concat(MM, DD);
}
function additionalData(
  productNr: string,
  dnb: string,
  productGroup: string
): string {
  let init: string = "067",
    P_126: string = "MOVI" + productGroup + dnb + productNr.padStart(10);
  return init + P_126.padEnd(67);
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
    TransactionAmount: dataElements.AMOUNT.split(".")
      .join("")
      .padStart(12, "0"),
    TransmissionDateTime: TransmissionDateTime(),
    SystemsTraceAuditNumber: dataElements.SYSTEMS_TRANCE.padStart(6, "0"),
    LocalTransactionTime: dateTime.time,
    LocalTransactionDate: dateTime.date,
    SettlementDate: SettlementDate(), // REVISAR
    CaptureDate: SettlementDate(), // REVISAR
    AcquiringInstitutionIdentificationCode: "03917",
    Track2Data: "170000000000000000=",
    RetrievalReferenceNumber: dataElements.RETRIEVAL_REFERENCE_NUMBER.padStart(
      12,
      "0"
    ),
    CardAcceptorTerminalID: ""
      .concat("TARE", dataElements.POS_ID.slice(-6))
      .padEnd(16),
    CardAcceptorNameLocation: "".concat(
      dataElements.POS_NAME,
      dataElements.POS_ID.padEnd(13),
      dataElements.POS_STATE,
      "MX" // POS COUNTRY
    ),
    AdditionalData: "044A                       300   48400000000000",
    TransactionCurrencyCode: "484",
    TerminalData: "012B917PRO1+" + dataElements.POS_TIME_ZONE,
    CardIssuerAndAuthorizer: "013            P",
    ReceivingIntitutionIDCode: "03917",
    AccountIdentification1:
      dataElements.ACCOUNT_ID.length.toString().padStart(2, "0") +
      dataElements.ACCOUNT_ID, // Posiblemente se cambie fijo a "040000"
    PosPreauthorizationChargebackData: additionalData(
      dataElements.PRODUCT_NR,
      dataElements.DNB,
      dataElements.PRODUCT_GROUP
    ),
  };
  return messageUnpack;
}
