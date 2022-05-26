export const fields: {
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
  CardIssuerAndAuthorizer: [61, "ans", 16, false, "info"], // antes long de 22
  OriginalDataElements: [90, "n", 42, false, "info"],
  ReceivingIntitutionIDCode: [100, "n", 11, false, "info"],
  AccountIdentification1: [102, "ans", 12, false, "info"], // antes long de 28
  PosPreauthorizationChargebackData: [126, "ans", 20, false, "info"], // long real 100, se usa 20 para pureba
};
