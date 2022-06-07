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

import {
  merge_0200,
  merge_0210_0430_0800_0810,
  merge_0420,
} from "../util/merges";
import {
  numberOfDataElements,
  hexa_bin_Bitmap,
} from "../util/hexa_bin";

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
  protected fieldsIso: {
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
    AdditionalData: [48, "ans", 47, false, "info"], // antes long de 30
    TransactionCurrencyCode: [49, "n", 3, false, "info"],
    TerminalData: [60, "ans", 15, false, "info"], // antes long de 19
    CardIssuerAndAuthorizer: [61, "ans", 16, false, "info"], // antes long de 22
    NetworkManagementInformationCode: [70, "n", 3, false, "info"],
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
        merge_0210_0430_0800_0810(dataElements, this.fieldsIso);
        break;
      case "0420":
        merge_0420(dataElements, this.fieldsIso);
        break;
      case "0430":
        merge_0210_0430_0800_0810(dataElements, this.fieldsIso);
        break;
      case "0800":
        merge_0210_0430_0800_0810(dataElements, this.fieldsIso);
        break;
      case "0810":
        merge_0210_0430_0800_0810(dataElements, this.fieldsIso);
        break;
      default:
        merge_0200(dataElements, this.fieldsIso);
        break;
    }
  }
  abstract getMti(): string;

  private bitmap: string = "";
  public getBitmap(): string {
    let DEs: number[] = numberOfDataElements(this.fieldsIso);
    let json_bitmap = hexa_bin_Bitmap(DEs);
    this.bitmap = json_bitmap.hexaPB;
    return this.bitmap;
  }

  private secondaryBitmap: string = "";
  public getScondaryBitmap(): string {
    let DEs: number[] = numberOfDataElements(this.fieldsIso);
    let json_bitmap = hexa_bin_Bitmap(DEs);
    this.secondaryBitmap = json_bitmap.hexaSB;
    return this.secondaryBitmap;
  }
  /**
   * Devuelve el mensaje en formato ISO-8583
   */
  getMessage(): string {
    const SE_USA = 3;
    let msg = "";
    this.fieldsIso.SecundaryBitmap[4] = this.getScondaryBitmap();
    this.fieldsIso.SecundaryBitmap[SE_USA] = true;
    msg = msg.concat(this.header, this.mti, this.getBitmap());
    const keys = Object.keys(this.fieldsIso);
    for (let i = 0; i < keys.length; i++) {
      if (this.fieldsIso[keys[i]][SE_USA]) {
        msg = msg.concat(this.fieldsIso[keys[i]][4].toString());
      }
    }
    return msg;
  }
  getTrancenr(): number {
    return Number(this.fieldsIso.RetrievalReferenceNumber[4]);
  }
  getFields(): {
    [keys: string]: (string | number | boolean)[];
  } {
    return this.fieldsIso;
  }
}
