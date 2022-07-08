import { hexa_bin_Bitmap, numberOfDataElements } from "../../util/hexa_bin";
import { merge } from "../../util/merges";
import { Field } from "./fields";
import { MTI } from "./MTI";

export class ISO8583 {
  /**
   * @class
   * The Context maintains a reference to one of the Strategy
   * objects. The Context does not know the concrete class of a strategy. It
   * should work with all strategies via the Strategy interface.
   */
  private mti: MTI;

  protected fieldsIso: {
    [keys: string]: Field;
  } = {
    MTI: {
      subcampo: 0,
      tipo: "n",
      longitud: 4,
      mandatorio: false,
      value: "info",
    },
    SecundaryBitmap: {
      subcampo: 1,
      tipo: "an",
      longitud: 16,
      mandatorio: false,
      value: "info",
    },
    ProcessingCode: {
      subcampo: 3,
      tipo: "n",
      longitud: 6,
      mandatorio: false,
      value: "info",
    }, // recarga code: “650500”
    TransactionAmount: {
      subcampo: 4,
      tipo: "n",
      longitud: 12,
      mandatorio: false,
      value: "info",
    },
    TransmissionDateTime: {
      subcampo: 7,
      tipo: "n",
      longitud: 10,
      mandatorio: false,
      value: "info",
    },
    SystemsTraceAuditNumber: {
      subcampo: 11,
      tipo: "n",
      longitud: 6,
      mandatorio: false,
      value: "info",
    },
    LocalTransactionTime: {
      subcampo: 12,
      tipo: "n",
      longitud: 6,
      mandatorio: false,
      value: "info",
    },
    LocalTransactionDate: {
      subcampo: 13,
      tipo: "n",
      longitud: 4,
      mandatorio: false,
      value: "info",
    },
    SettlementDate: {
      subcampo: 15,
      tipo: "n",
      longitud: 4,
      mandatorio: false,
      value: "info",
    },
    CaptureDate: {
      subcampo: 17,
      tipo: "n",
      longitud: 4,
      mandatorio: false,
      value: "info",
    },
    AcquiringInstitutionIdentificationCode: {
      subcampo: 32,
      tipo: "n",
      longitud: 11,
      mandatorio: false,
      value: "info",
    }, // Este subcampo debe der asignado por Telefónica Movistar Valor fijo del subcampo “03XXX”
    Track2Data: {
      subcampo: 35,
      tipo: "ans",
      longitud: 37,
      mandatorio: false,
      value: "info",
    },
    RetrievalReferenceNumber: {
      subcampo: 37,
      tipo: "arn",
      longitud: 12,
      mandatorio: false,
      value: "info",
    },
    AuthorizationIdentificationResponse: {
      subcampo: 38,
      tipo: "an",
      longitud: 6,
      mandatorio: false,
      value: "info",
    },
    ResponseCode: {
      subcampo: 39,
      tipo: "an",
      longitud: 2,
      mandatorio: false,
      value: "info",
    },
    CardAcceptorTerminalID: {
      subcampo: 41,
      tipo: "ans",
      longitud: 16,
      mandatorio: false,
      value: "info",
    },
    CardAcceptorNameLocation: {
      subcampo: 43,
      tipo: "ans",
      longitud: 40,
      mandatorio: false,
      value: "info",
    },
    AdditionalData: {
      subcampo: 48,
      tipo: "ans",
      longitud: 47,
      mandatorio: false,
      value: "info",
    }, // antes long de 30
    TransactionCurrencyCode: {
      subcampo: 49,
      tipo: "n",
      longitud: 3,
      mandatorio: false,
      value: "info",
    },
    TerminalData: {
      subcampo: 60,
      tipo: "ans",
      longitud: 15,
      mandatorio: false,
      value: "info",
    }, // antes long de 19
    CardIssuerAndAuthorizer: {
      subcampo: 61,
      tipo: "ans",
      longitud: 16,
      mandatorio: false,
      value: "info",
    }, // antes long de 22
    NetworkManagementInformationCode: {
      subcampo: 70,
      tipo: "n",
      longitud: 3,
      mandatorio: false,
      value: "info",
    },
    OriginalDataElements: {
      subcampo: 90,
      tipo: "n",
      longitud: 42,
      mandatorio: false,
      value: "info",
    },
    ReceivingIntitutionIDCode: {
      subcampo: 100,
      tipo: "n",
      longitud: 11,
      mandatorio: false,
      value: "info",
    },
    AccountIdentification1: {
      subcampo: 102,
      tipo: "ans",
      longitud: 12,
      mandatorio: false,
      value: "info",
    }, // antes long de 28
    PosPreauthorizationChargebackData: {
      subcampo: 126,
      tipo: "ans",
      longitud: 20,
      mandatorio: false,
      value: "info",
    }, // long real 100, se usa 20 para pureba
  };

  /**
   * Usually, the Context accepts a mti through the constructor, but also
   * provides a setter to change it at runtime.
   */
  constructor(mti: MTI) {
    this.mti = mti;
  }

  /**
   * Usually, the Context allows replacing a mti object at runtime.
   */
  public setMti(mti: MTI) {
    this.mti = mti;
  }
  public setFields(dataElements: { [key: string]: string }, mti: string) {
    merge(mti, dataElements, this.fieldsIso);
  }
  getFields(): {
    [keys: string]: Field;
  } {
    return this.fieldsIso;
  }
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
  getTrancenr(): number {
    return Number(this.fieldsIso["RetrievalReferenceNumber"]["value"]);
  }
  /**
   * The Context delegates some work to the mti object instead of
   * implementing multiple versions of the algorithm on its own.
   */
  public getMessage(): string {
    let msg = "";
    this.fieldsIso.SecundaryBitmap["value"] = this.getScondaryBitmap();
    this.fieldsIso.SecundaryBitmap["mandatorio"] = true;
    msg = this.mti.getHeaderMessage(this.getBitmap());
    const keys = Object.keys(this.fieldsIso);
    for (let i = 0; i < keys.length; i++) {
      if (this.fieldsIso[keys[i]]["mandatorio"]) {
        msg = msg.concat(this.fieldsIso[keys[i]]["value"].toString());
      }
    }
    return msg;
  }
  public getMessage0210(): string {
    let msg = "";
    msg = msg.concat(
      String.fromCharCode(2),
      this.fieldsIso["AccountIdentification1"]["value"].toString(), // Account (6)
      this.fieldsIso["CardAcceptorNameLocation"]["value"]
        .toString()
        .substr(0, 10), // Pos_id (10)
      this.fieldsIso["LocalTransactionDate"]["value"].toString(), // pos date (8)
      this.fieldsIso["LocalTransactionTime"]["value"].toString(), // pos time (6)
      this.fieldsIso["PosPreauthorizationChargebackData"]["value"]
        .toString()
        .substr(8, 10), // DNB (10)
      this.fieldsIso["TransactionAmount"]["value"].toString().substr(2, 10), // Amount (10)
      this.fieldsIso["PosPreauthorizationChargebackData"]["value"]
        .toString()
        .substr(7, 1), // Product group (1)
      this.getproduct_NR(), // PRODUCT_NR no viene de MOVISTAR PREGUNTAR POR QUE?
      "2", // 2 fijo (1)
      this.fieldsIso["ResponseCode"]["value"].toString(), // response code (2)
      this.fieldsIso["AuthorizationIdentificationResponse"]["value"].toString(), // Authorization NR (6)
      this.fieldsIso["RetrievalReferenceNumber"]["value"]
        .toString()
        .padStart(10, "0"), // ID (10)
      "00", // ERROR si hay algun error se notifica mediante este parametro
      String.fromCharCode(3)
    );
    return msg;
  }
  private product_NR: string = "";
  public setProduct_NR(product_NR: string) {
    this.product_NR = product_NR;
  }
  public getproduct_NR(): string {
    return this.product_NR ? this.product_NR : "0000";
  }
  getResponseCode(): number {
    return Number(this.fieldsIso["ResponseCode"]["value"]);
  }
  addYearLocalTransactionDate(year: number) {
    this.fieldsIso.LocalTransactionDate["value"] =
      year.toString() + this.fieldsIso.LocalTransactionDate["value"];
  }
  getSystemTraceAuditNumber(): number {
    return Number(this.fieldsIso["SystemsTraceAuditNumber"]["value"]);
  }
  public getMti(): string {
    return this.mti.getMti();
  }
}
