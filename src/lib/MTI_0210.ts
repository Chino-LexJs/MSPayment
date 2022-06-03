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
  /**
   * @override
   * El getMessage de la clase 0210 no retorna un string en formato ISO8583 como las demas clases
   * Este getMessage retorna una trama de forma ISO-0210-RCES
   * Ya que un msj 0210 de Movistar solo se retorna al sistema RCES y se almacena en la base de datos
   * @returns trama con formato ISO-0210-RCES
   */
  getMessage(): string {
    let msg = "";
    this.fieldsIso.SecundaryBitmap[4] = this.getScondaryBitmap();
    this.fieldsIso.SecundaryBitmap[3] = true;
    msg = msg.concat(
      String.fromCharCode(2),
      this.fieldsIso.AccountIdentification1[4].toString(), // Account (6)
      this.fieldsIso.CardAcceptorNameLocation[4].toString().substr(0, 10), // Pos_id (10)
      this.fieldsIso.LocalTransactionDate[4].toString(), // pos date (8)
      this.fieldsIso.LocalTransactionTime[4].toString(), // pos time (6)
      this.fieldsIso.PosPreauthorizationChargebackData[4]
        .toString()
        .substr(8, 10), // DNB (10)
      this.fieldsIso.TransactionAmount[4].toString().substr(2, 10), // Amount (10)
      this.fieldsIso.PosPreauthorizationChargebackData[4]
        .toString()
        .substr(7, 1), // Product group (1)
      this.getproduct_NR(), // PRODUCT_NR no viene de MOVISTAR PREGUNTAR POR QUE?
      "2", // 2 fijo (1)
      this.fieldsIso.ResponseCode[4].toString(), // response code (2)
      this.fieldsIso.AuthorizationIdentificationResponse[4].toString(), // Authorization NR (6)
      this.fieldsIso.RetrievalReferenceNumber[4].toString().padStart(10, "0"), // ID (10)
      "00", // ERROR si hay algun error se notifica mediante este parametro
      String.fromCharCode(3)
    );
    return msg;
  }
  getMti(): string {
    return this.mti;
  }
  addYearLocalTransactionDate(year: number) {
    this.fieldsIso.LocalTransactionDate[4] =
      year.toString() + this.fieldsIso.LocalTransactionDate[4];
  }
  private product_NR: string = "";
  public setProduct_NR(product_NR: string) {
    this.product_NR = product_NR;
  }
  public getproduct_NR(): string {
    return this.product_NR ? this.product_NR : "0000";
  }
}
