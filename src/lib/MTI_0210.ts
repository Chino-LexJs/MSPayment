import {
  util_hexa_bin_Bitmap,
  numberOfDataElements,
} from "../util/util_hexa_bin";
import { ISO8583 } from "../lib/iso8583";

export class MTI0210 extends ISO8583 {
  then(arg0: (msj0210: any) => void) {
    throw new Error("Method not implemented.");
  }
  constructor(dataElements: { [keys: string]: string }, mti: string) {
    super(dataElements, mti);
    this.header = "ISO001300055";
    this.mti = mti;
  }

  private bitmap: string = "";
  public getBitmap(): string {
    let DEs: number[] = numberOfDataElements(this.fieldsIso); // DEs sin condicionales
    let json_bitmap = util_hexa_bin_Bitmap(DEs);
    this.bitmap = json_bitmap.hexaPB;
    return this.bitmap;
  }

  private secondaryBitmap: string = "";
  public getScondaryBitmap(): string {
    let DEs: number[] = numberOfDataElements(this.fieldsIso); // DEs sin condicionales
    let json_bitmap = util_hexa_bin_Bitmap(DEs);
    this.secondaryBitmap = json_bitmap.hexaSB;
    return this.secondaryBitmap;
  }
  getMessage(): string {
    let msg = "";
    this.fieldsIso.SecundaryBitmap[4] = this.getScondaryBitmap();
    this.fieldsIso.SecundaryBitmap[3] = true;
    const keys = Object.keys(this.fieldsIso);
    msg = msg.concat(
      String.fromCharCode(2),
      this.fieldsIso.AccountIdentification1[4].toString(),
      this.fieldsIso.CardAcceptorNameLocation[4].toString().substr(0, 10),
      this.fieldsIso.LocalTransactionTime[4].toString(),
      this.fieldsIso.LocalTransactionDate[4].toString().substr(8, 10),
      this.fieldsIso.TransactionAmount[4].toString().substr(2, 10),
      this.fieldsIso.PosPreauthorizationChargebackData[4]
        .toString()
        .substr(7, 1),
      "0000", // PRODUCT_NR no viene de MOVISTAR PREGUNTAR POR QUE?
      this.fieldsIso.ResponseCode[4].toString(),
      this.fieldsIso.AuthorizationIdentificationResponse[4].toString(),
      "0123456789", // ID PREGUNTAR QUE ES
      "00", // ERROR si hay algun error se notifica mediante este parametro
      String.fromCharCode(3)
    );
    return msg;
  }
  getMti(): string {
    return this.mti;
  }
  getFields(): {
    [keys: string]: (string | number | boolean)[];
  } {
    return this.fieldsIso;
  }
}
