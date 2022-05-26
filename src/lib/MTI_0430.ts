import {
  util_hexa_bin_Bitmap,
  numberOfDataElements,
} from "../util/util_hexa_bin";
import { ISO8583 } from "../lib/iso8583";

export class MTI0430 extends ISO8583 {
  then(arg0: (msj0430: any) => void) {
    throw new Error("Method not implemented.");
  }
  constructor(dataElements: { [keys: string]: string }, mti: string) {
    super(dataElements, mti);
    this.header = "ISO026000055";
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
    msg = msg.concat(this.header, this.mti, this.getBitmap());
    this.fieldsIso.SecundaryBitmap[4] = this.getScondaryBitmap();
    this.fieldsIso.SecundaryBitmap[3] = true;
    const keys = Object.keys(this.fieldsIso);
    for (let i = 0; i < keys.length; i++) {
      if (this.fieldsIso[keys[i]][3]) {
        msg = msg.concat(this.fieldsIso[keys[i]][4].toString());
      }
    }
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
  getTrancenr(): number {
    return Number(this.fieldsIso.RetrievalReferenceNumber[4]);
  }
  getResponseCode(): number {
    return Number(this.fieldsIso.ResponseCode[4]);
  }
}
