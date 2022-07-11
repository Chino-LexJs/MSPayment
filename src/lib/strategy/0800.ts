/**
 * @module Strategy
 * Clase para manejar los msj iso 0800
 * @class MTI0800
 */
import { MTI } from "./MTI";
/**
 * @class MTI0800
 * @classdesc clase para abstraer msj de tipo 0800
 */
export class MTI0800 implements MTI {
  /**
   * @desc tipo de mensaje
   * @type {string}
   */
  private mti: string = "0800";
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
