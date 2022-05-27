/**
 * Clase contenedora para mensajes ISO 8583
 * Contiene los menasjes para las llamadas:
 * 0200 Solicitud de transaccion financiera
 * 0210 Respuesta de transaccion financiera
 * 0220 Asesoramiento de transaccion financiera
 * 0230 Respuesta de aviso de transaccion financiera
 * 0420 Aviso de reversion del adquiriente
 * 0430 Respuesta de inversion del adquiriente
 * 0800 Solicitud de gestion de red
 * 0810 Respuesta de solicitud de gestion de red
 */

import { getConstantValue } from "typescript";
import { fields } from "../util/fields";
import { merge_0200, merge_0210_0430, merge_0420 } from "../util/mergeRCES";

export abstract class ISO8583 {
  header: string = "";
  mti: string = "";

  /**
   * FIELDS:
   * [
   * 0: tipo (string),
   * 1: cantidad según tipo (number),
   * 2: nombre data element (string),
   * 3: M (Boolean),
   * 4: info de data element (string)
   * ]
   */
  public fieldsIso: {
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

  /**
   *
   * @param dataElements Objeto con los Data Elements correspondientes de cada sub clase
   * @param mti Tipo de Mensaje, sirve para diferenciar el estado y comportamiento de cada sub clase
   */
  constructor(dataElements: { [keys: string]: string }, mti: string) {
    switch (mti) {
      case "0200":
        merge_0200(dataElements, this.fieldsIso);
        break;
      case "0210":
        merge_0210_0430(dataElements, this.fieldsIso);
        break;
      case "0420":
        merge_0420(dataElements, this.fieldsIso);
        break;
      case "0430":
        merge_0210_0430(dataElements, this.fieldsIso);
        break;
      default:
        merge_0200(dataElements, this.fieldsIso);
        break;
    }
  }
  /**
   * Devuelve el mensaje en formato ISO-8583
   */
  abstract getMessage(): string;

  abstract getMti(): string;
  //   abstract getHeader(): string;
  //   abstract getPBitmap_Hex(): string;
  //   abstract getPBitmao_Bin(): string;
  //   abstract validateMessage(): Boolean;
  //   abstract checkMTI(): Boolean;
}
