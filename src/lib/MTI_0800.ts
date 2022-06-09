import { ISO8583 } from "../lib/iso8583";

export class MTI0800 extends ISO8583 {
  then(arg0: (msj0800: any) => void) {
    throw new Error("Method not implemented.");
  }
  constructor(dataElements: { [keys: string]: string }, mti: string) {
    super(dataElements, mti);
    this.header = "ISO001300055";
    this.mti = mti;
  }

  getMti(): string {
    return this.mti;
  }
  getSystemTraceAuditNumber(): number {
    return Number(this.fieldsIso.SystemsTraceAuditNumber[4]);
  }
}