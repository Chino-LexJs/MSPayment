import { MTI } from "./MTI";

export class MTI0420 implements MTI {
  private mti: string = "0420";
  private header = "ISO001300055";

  public getHeaderMessage(bitmap: string): string {
    let msg = "";
    msg = msg.concat(this.getHeader(), this.getMti(), bitmap);
    return msg;
  }
  getMti(): string {
    return this.mti;
  }
  getHeader(): string {
    return this.header;
  }
}