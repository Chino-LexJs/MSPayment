import { MTI } from "./MTI";

export class MTI0430 implements MTI {
  private mti: string = "0430";
  private header = "ISO026000055";

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
