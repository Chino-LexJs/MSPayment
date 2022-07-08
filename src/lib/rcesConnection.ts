/**
 * Clase para manejar los msj entrantes y salientes de RCES
 * @module RCES
 * @class RRCES
 */
import { MTI0200 } from "./strategy/0200";
import { ISO8583 } from "./strategy/8583";
import { closeConnection, saveConnection } from "../connection/rces";
import { saveRequest } from "../db/request.controllers";
import { saveMessageDataBase, unpack } from "../util";

/**
 * @module RCES
 * @classdesc Esta clase esta diseñada para contener el manejador de msj para RCES mediante sockets
 * @clase
 */
export class RCES {
  /**
   * @module RCES
   * @desc Propiedad que contendra la conexion socket para recibir y enviar msj
   * @type {any}
   */
  private socket: any;
  /**
   * @module RCES
   * @desc Propiedad que contendra la conexion socket para enviar msj a Movistar
   * @type {any}
   */
  private socketMovistar: any;
  /**
   * @module RCES
   * @desc Se establecio un limite de tiempo para la conexion socket de 55 segundos
   * @type {number}
   */
  private TIEMPO_CONEXION_RCES: number = 55000;

  /**
   * @module RCES
   * @constructor
   * @param {any} socket socket de la conexion que se establecio para recibir msj
   */
  constructor(socket: any) {
    this.socket = socket;
    this.socket.setEncoding("utf8"); // se configura socket para manejar cadena de caracteres en el buffer[]
    this.socket.on("data", async (message: string) => {
      console.log("\nMensaje de RCES sin formato: ");
      console.log(message);
      let id_request = await this.messageFromRCES(
        message,
        this.socket.remoteAddress
      );
      saveConnection(id_request, socket);
    });
    this.socket.on("close", () => {
      closeConnection(this.socket);
      console.log(`\nComunicacion finalizada con RCS`);
    });
    this.socket.on("error", function (err: Error) {
      console.log(`Error: ${err}`);
    });
    this.socket.setTimeout(this.TIEMPO_CONEXION_RCES); // Tiempo limite de conexión
    this.socket.on("timeout", () => {
      console.log("Connexion socket con RCES timeout");
      this.socket.end();
    });
  }
  /**
   * @module RCES
   * @function getSocket
   * @desc devuelde el socket que contiene la conexion con RCES
   * @return {any} socket con conexion a RCES
   */
  public getSocket(): any {
    return this.socket;
  }
  /**
   * @module RCES
   * @function setSocketMovistar
   * @desc configura la conexion socket a Movistar para el envio de msj
   * @param {any} socket socket que contiene la conexion a Movistar
   */
  public setSocketMovistar(socket: any) {
    this.socketMovistar = socket;
  }
  /**
   * @module RCES
   * @function messageFromRCES
   * @desc Manejador para msj de RCES, este proceso es asincronico ya que guarda msj en la base de datos
   * @param {string}  message Mensaje enviado de RCES en formato RCES
   * @param {string} ipClient Ip del dispositivo donde enviaron el msj
   * @returns {Promise<number>}
   */
  private async messageFromRCES(
    message: string,
    ipClient: string
  ): Promise<number> {
    let dataUnpack: { [key: string]: string } = unpack(message);
    console.log("\nMensage de RCES deslozado: ");
    console.log(dataUnpack);
    let id_request = await this.saveRequestMessage(dataUnpack, ipClient);
    this.addIdRquest(dataUnpack, id_request);
    let mti0200 = new ISO8583(new MTI0200());
    mti0200.setFields(dataUnpack, "0200");
    console.log("\nData elements generados por el msj 0200 de RCES:");
    console.log(mti0200.getFields());
    console.log("\nMensaje 0200 en formato ISO8583 enviado a Movistar:");
    console.log(mti0200.getMessage());
    this.socketMovistar.write(mti0200.getMessage(), "utf8");
    await saveMessageDataBase(
      mti0200.getMti(),
      mti0200.getTrancenr(),
      mti0200.getMessage()
    );
    return id_request;
  }
  /**
   * @module RCES
   * @function posDate
   * @desc Recibe una fecha del Posnet en formato de cadena de caracteres y devuelve la fecha en formato Date
   * @param {string} date fecha en formato de cadena de caracteres
   * @returns {Date} fecha en formato Date
   */
  private posDate(date: string): Date {
    return new Date(
      Number(date.substr(0, 4)),
      Number(date.substr(4, 2)),
      Number(date.substr(6))
    );
  }

  /**
   * @module RCES
   * @function posDate
   * @desc recibe fecha y tiempo en formato de cadena de caracteres y devuelve una fecha y tiempo en formato Date
   * @param {string} date fecha en formato de cadena de caracteres
   * @param {string} time tiempo en formato de cadena de caracteres
   * @returns {Date} fecha y tiempo en formato Date
   */
  private posTime(date: string, time: string): Date {
    return new Date(
      Number(date.substr(0, 4)),
      Number(date.substr(4, 2)),
      Number(date.substr(6)),
      Number(time.substr(0, 2)),
      Number(time.substr(2, 2)),
      Number(time.substr(4))
    );
  }
  /**
   * @module RCES
   * @function saveRequestMessage
   * @desc Almacena el msj de solicitud de RCES en la base de datos, y devuelve el id del elemento almacenado
   * @param dataUnpack elementos del msj de RCES desempaquetado en formato objeto
   * @param ipClient ip del cliente en formato de cadena de caracteres
   * @returns {Promie<number>} id del elemento request almacenado en la base de datos
   * @see messageFromRCES
   */
  private async saveRequestMessage(
    dataUnpack: { [key: string]: string },
    ipClient: string
  ): Promise<number> {
    let posdate = this.posDate(dataUnpack.POS_DATE);
    let postime = this.posTime(dataUnpack.POS_DATE, dataUnpack.POS_TIME);
    let valuesRequest = {
      date_request: new Date(),
      time_request: new Date(),
      ip: ipClient,
      account_id: Number(dataUnpack.ACCOUNT_ID),
      pos_id: Number(dataUnpack.POS_ID),
      pos_name: dataUnpack.POS_NAME,
      pos_state: dataUnpack.POS_STATE,
      postimezona: Number(dataUnpack.POS_TIME_ZONE),
      posdate,
      postime,
      dnb: dataUnpack.DNB,
      amount: Number(dataUnpack.AMOUNT),
      productgroup: dataUnpack.PRODUCT_GROUP,
      product_nr: Number(dataUnpack.PRODUCT_NR),
      responsecode: Number(dataUnpack.RESPONSE_CODE),
      authorizationnr: Number(dataUnpack.AUTORIZATION_NR),
      error: 0, // HARDCODEADO
      action: Number(dataUnpack.ACTION),
    };
    let id_request = await saveRequest(
      valuesRequest.date_request,
      valuesRequest.time_request,
      valuesRequest.ip,
      valuesRequest.account_id,
      valuesRequest.pos_id,
      valuesRequest.pos_name,
      valuesRequest.pos_state,
      valuesRequest.postimezona,
      valuesRequest.posdate,
      valuesRequest.postime,
      valuesRequest.dnb,
      valuesRequest.amount,
      valuesRequest.productgroup,
      valuesRequest.product_nr,
      valuesRequest.responsecode,
      valuesRequest.authorizationnr,
      valuesRequest.error,
      valuesRequest.action
    );
    return id_request;
  }
  /**
   * @module RCES
   * @function addIdRquest
   * @desc agrega el elemento SYSTEMS_TRANCE con 6 digitos del id de la solicitud y RETRIEVAL_REFERENCE_NUMBER con la longitud exacta del id de la solicitud que se almaceno en la base de datos
   * @param {object} dataUnpack elementos del msj de RCES en formato objeto
   * @param {number} id_request id del msj de solicitud o request almacenado en la base de datos
   */
  private addIdRquest(
    dataUnpack: { [key: string]: string },
    id_request: number
  ) {
    dataUnpack.SYSTEMS_TRANCE = id_request.toString().slice(-6); // Si el numero supera los 6 digitos P-11 solo capta hasta 6 digitos
    dataUnpack.RETRIEVAL_REFERENCE_NUMBER = id_request.toString();
  }
}
