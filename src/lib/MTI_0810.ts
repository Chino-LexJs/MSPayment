/**
 * Clases para distintos mensajes en formato ISO 8583
 * @module Lib
 */
import { MTI0800 } from "./MTI_0800";

export class MTI0810 extends MTI0800 {
  then(arg0: (msj0810: any) => void) {
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
}
