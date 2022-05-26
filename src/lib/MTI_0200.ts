import {
  util_hexa_bin_Bitmap,
  numberOfDataElements,
} from "../util/util_hexa_bin";
import { ISO8583 } from "../lib/iso8583";

export class MTI0200 extends ISO8583 {
  then(arg0: (msj0200: any) => void) {
    throw new Error("Method not implemented.");
  }
  constructor(dataElements: { [keys: string]: string }, mti: string) {
    super(dataElements, mti);
    this.header = "ISO001300055";
    this.mti = "0200";
  }
  /**
   *
   * bitmap binary con condicionales:
   * 1011001000111000110001001000000100101000111000011000010000011110
   *
   * bitmap hexadecimal con condicionales:
   * B238C48128E1841E
   *
   * bitmap binary sin condicionales:
   * 1011001000111000110001000000000100101000101000011000000000011010
   *
   * bitmap hexadecimal sin condicionales:
   * B238C40128A1801A
   */

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
}
