import { MTI0420 } from "./MTI_0420";

export class MTI0430 extends MTI0420 {
  then(arg0: (msj0430: any) => void) {
    throw new Error("Method not implemented.");
  }
  constructor(dataElements: { [keys: string]: string }, mti: string) {
    super(dataElements, mti);
    this.header = "ISO026000055";
    this.mti = mti;
  }

  getMti(): string {
    return this.mti;
  }
}
