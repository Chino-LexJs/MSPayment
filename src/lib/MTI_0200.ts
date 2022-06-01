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
    this.mti = mti;
  }

  private bitmap: string = "";
  public getBitmap(): string {
    let DEs: number[] = numberOfDataElements(this.fieldsIso);
    let json_bitmap = util_hexa_bin_Bitmap(DEs);
    this.bitmap = json_bitmap.hexaPB;
    return this.bitmap;
  }

  private secondaryBitmap: string = "";
  public getScondaryBitmap(): string {
    let DEs: number[] = numberOfDataElements(this.fieldsIso);
    let json_bitmap = util_hexa_bin_Bitmap(DEs);
    this.secondaryBitmap = json_bitmap.hexaSB;
    return this.secondaryBitmap;
  }
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
  getMti(): string {
    return this.mti;
  }
  getFields(): {
    [keys: string]: (string | number | boolean)[];
  } {
    return this.fieldsIso;
  }
}
