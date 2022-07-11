/**
 * @module Strategy
 * Clase para manejar los msj iso 0210
 * @class MTI0210
 */
import { MTI } from "./MTI";

/**
 * @class MTI0210
 * @classdesc clase para abstraer msj de tipo 0210
 */
export class MTI0210 implements MTI {
  /**
   * @desc tipo de mensaje
   * @type {string}
   */
  private mti: string = "0210";
  /**
   * @desc header particular de la clase
   * @type {string}
   */
  private header: string = "ISO001300055";

  /**
   * @function getHeaderMessage
   * @desc devuelve el header para el msj
   * @param {string} bitmap bit map primario
   * @returns {string}
   */
  public getHeaderMessage(bitmap: string): string {
    let msg = "";
    msg = msg.concat(this.getHeader(), this.getMti(), bitmap);
    return msg;
  }
  /**
   * @function getMti
   * @desc devuelve el tipo de msj
   * @returns {string}
   */
  getMti(): string {
    return this.mti;
  }
  /**
   * @function getHeader
   * @desc devuelve solo el header
   * @returns {string}
   */
  getHeader(): string {
    return this.header;
  }
}
