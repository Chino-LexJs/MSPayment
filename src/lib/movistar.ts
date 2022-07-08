/**
 * Clases para distintos mensajes en formato ISO 8583 de Movistar
 * @module Movistar
 * @class Movistar
 */
import { findConnection, sendMessageConnection } from "../connection/rces";
import { getMessage } from "../db/message.controllers";
import {
  setResponseDataRequest,
  setReverse_idRequest,
} from "../db/request.controllers";
import {
  getReverseByRequestId,
  saveReverse,
  setIsoMessage0430,
} from "../db/reverse.controllers";
import { saveMessageDataBase, TransmissionDateTime, unpack_ISO } from "../util";
import { MTI0430 } from "./strategy/0430";
import { MTI0210 } from "./strategy/0210";
import { MTI0420 } from "./strategy/0420";
import { MTI0800 } from "./strategy/0800";
import { MTI0810 } from "./strategy/0810";
import { ISO8583 } from "./strategy/8583";

const { Socket } = require("net");
const to_MOVISTAR = {
  host: "localhost",
  port: 8000,
};

/**
 * @module Movistar
 * @classdesc Esta clase esta diseñada con el patron Singleton, sirve para ser la conexion con Movistar
 * @clase
 * Contiene la conexion socket a moviestar y el comportamiento de los msj entrantes y salientes
 */
class Movistar {
  private connecting: boolean;
  private socket: any;
  private tiempoRespuesta: number = 55;
  private static instance: Movistar;

  /**
   * @module Movistar
   * @constructor The Singleton's constructor should always be private to prevent direct
   * @hideconstructor
   */
  private constructor() {
    this.connecting = false;
  }
  /**
   * @module Movistar
   * @function getInstance
   * @desc Static method that controls the access to the singleton instance.
   * @return {Movistar} unica instancia de movistar
   */
  public static getInstance(): Movistar {
    if (!Movistar.instance) {
      Movistar.instance = new Movistar();
    }
    return Movistar.instance;
  }
  /**
   * @module Movistar
   * @function connect
   * @description Establece conexion socket a Movistar
   * @desc Se conecta mediante socket a Movistar si la conexion esta cerrada
   */
  public connect() {
    if (!this.connecting) {
      this.socket = new Socket();
      this.socket.connect(to_MOVISTAR);
      this.setConnecting(true);
      this.socket.setEncoding("utf8"); // se configura socket para manejar cadena de caracteres en el buffer[]
      this.socket.on("data", (message: string) => this.onData(message));
      this.socket.on("close", () => {
        console.log(`\nComunicacion con MOVISTAR finalizada`);
        this.setConnecting(false);
        this.socket.destroy();
      });
      this.socket.on("error", (err: Error): void => {
        this.setConnecting(false);
        this.socket.destroy();
      });
    }
  }
  /**
   * @module Movistar
   * @function getSocket
   * @desc Devuelve la conexion socket a Movistar
   * @returns {any} Socket con conexion a Movistar
   */
  public getSocket(): any {
    return this.socket;
  }
  /**
   * @module Movistar
   * @function getProductNr
   * @desc Devuelve el valor de Product Number
   * @param {string} PosPreauthorizationChargebackData String que contiene Product Number, DNB y Product Group
   * @returns {string} Product Number
   */
  private getProductNr(PosPreauthorizationChargebackData: string): string {
    return PosPreauthorizationChargebackData.substr(24, 4);
  }
  /**
   * @module Movistar
   * @function setConnecting
   * @desc Dependiendo el valor que se envia por parametro, se modifica el estado conectado de la instancia
   * @param {boolean} state estado de conectado(true) o desconectado (false)
   */
  private setConnecting(state: boolean): void {
    this.connecting = state;
  }
  /**
   * @module Movistar
   * @function getMti
   * @desc La trama message debe tener el mti en los primeros 4 caracteres
   * @borrows substr
   * @param {string} message Mensaje ISO 8583 de Movistar
   * @returns {string} mti type of message ej: 0200, 0210, 0430, 0800, 0810
   */
  private getMti(message: string): string {
    return message.substr(0, 4);
  }
  /**
   * @module Movistar
   * @function onData
   * @desc Recibe msj en formato sio 8583 y determina que manejador usar segun su mti
   * @param {string} message msj de movistar en formato iso8583
   */
  private onData(message: string) {
    let mtiMessage = this.getMti(message);
    switch (mtiMessage) {
      case "0210":
        this.message0210(message);
        break;
      case "0430":
        this.message0430(message);
        break;
      case "0800":
        this.message0800(message);
      default:
        console.log("\nTipo de mensaje (MTI) no soportado por el Servidor");
        break;
    }
  }
  /**
   * @module Movistar
   * @function message0210
   * @desc Administra los msj entrantes de Movistar, si la diferencia en segundos entre el tiempo que se envio el msj 0200 y el msj 0210 de respuesta es mayor a 55 se envia msj 0420 a Movistar, sino se envia respuesta 0210 en formato RCES a RCES
   * @borrows unpack_ISO, ISO8583, MTI0210, saveMessageDataBase, setResponseDataRequest, getMessage, sendMessage0420
   * @param {string} message msj 0210 en formato iso8583
   */
  private async message0210(message: string) {
    console.log("\nMensaje 0210 de MOVISTAR en formato ISO8583:");
    console.log(message);
    let newFieldes: { [key: string]: string } = unpack_ISO(message);
    console.log("\nData elements de msj 0210 de Movistar: ");
    console.log(newFieldes);
    let mti0210 = new ISO8583(new MTI0210());
    mti0210.setFields(newFieldes, "0210");
    await saveMessageDataBase(mti0210.getMti(), mti0210.getTrancenr(), message);
    let newDate = new Date();
    await setResponseDataRequest(mti0210.getTrancenr(), newDate, newDate);
    /**
     * getMessage(trancenr) busca el mensaje 0200 que se envio a Movistar
     * res es el mensaje guardado en la base de datos de tipo 0200
     */
    let message0200: any = await getMessage(mti0210.getTrancenr());
    let jsonDate = {
      year: new Date(message0200.date).getFullYear(),
      month: new Date(message0200.date).getMonth(),
      day: new Date(message0200.date).getDate(),
      hour: message0200.time.slice(0, 2),
      minutes: message0200.time.slice(3, 5),
      seconds: message0200.time.slice(6),
    };
    /**
     * difDates contiene la diferencia de tiempo en segundos entre la hora en que se envio el msj 0200 a Movistar y la hora de respuesta 0210
     */
    let difDates = Math.round(
      (new Date().getTime() -
        new Date(
          jsonDate.year,
          jsonDate.month,
          jsonDate.day,
          jsonDate.hour,
          jsonDate.minutes,
          jsonDate.seconds
        ).getTime()) /
        1000
    );
    if (difDates > this.tiempoRespuesta) {
      // se envia msj 0420 y se genera un elemento reverso en la tabla de reversos de la DB
      this.sendMessage0420(mti0210);
    } else {
      // se guarda msj 0210 que se envia a RCES, se genera un msj 0210 para RCES y se envia msj a RCES
      mti0210.addYearLocalTransactionDate(jsonDate.year); // Se agrega el año del request almacenado en la db
      let fields0200: { [key: string]: string } = unpack_ISO(
        message0200.message.substr(12)
      );
      mti0210.setProduct_NR(
        this.getProductNr(fields0200.PosPreauthorizationChargebackData)
      );
      await saveMessageDataBase(
        mti0210.getMti(),
        mti0210.getTrancenr(),
        mti0210.getMessage0210()
      );
      /**
       * Se busca entre las distintas conexiones que se establecieron con RCES y se envia la respuesta 0210 a la conexion correspondiente
       */
      if (findConnection(mti0210.getTrancenr())) {
        sendMessageConnection(mti0210.getTrancenr(), mti0210.getMessage0210());
        console.log("\nMensaje que se envia a RCES en formato RCES");
        console.log(mti0210.getMessage0210());
      } else {
        console.log("\nNo se encontro cliente, se envia msj 0420 a Movistar");
        this.sendMessage0420(mti0210);
      }
    }
  }
  /**
   * @module Movistar
   * @function sendMessage0420
   * @param {ISO8583} mti0210 mensaje 0210 que se usa para el armado de msj 0420
   * @borrows ISO8583, MTI0420, saveMessageDataBase, saveReverse
   */
  private async sendMessage0420(mti0210: ISO8583) {
    let fields0420: { [key: string]: string } = {};
    let fields0210 = mti0210.getFields();
    const MANDATORIO = "mandatorio";
    const VALUE = "value";
    // Los parametros que se envian en el msj 0420 son similares al 0210 por lo que se copian los valores
    for (const key in fields0210) {
      if (fields0210[key][MANDATORIO]) {
        fields0420[key] = fields0210[key][VALUE].toString();
      }
    }
    let mti0420 = new ISO8583(new MTI0420());
    mti0420.setFields(fields0420, "0420");
    console.log("\nMensaje 0420 a Movistar en formato ISO8583:");
    console.log(mti0420.getMessage());
    console.log("\nData elements usados en el msj 0420 a Movistar: ");
    console.log(mti0420.getFields());
    this.socket.write(mti0420.getMessage(), "utf8");
    let id_mti0420 = await saveMessageDataBase(
      mti0420.getMti(),
      mti0420.getTrancenr(),
      mti0420.getMessage()
    );
    let values = {
      date: new Date(),
      time: new Date(),
      request_id: mti0210.getTrancenr(),
      isomessage420_id: id_mti0420,
      responsecode: mti0420.getResponseCode(),
      referencenr: 123,
      retries: 1,
    };
    saveReverse(
      values.date,
      values.time,
      values.request_id,
      values.isomessage420_id,
      values.responsecode,
      values.referencenr,
      values.retries
    ).then(async (reverse_id) => {
      await setReverse_idRequest(mti0210.getTrancenr(), reverse_id);
    });
  }
  /**
   * @module Movistar
   * @function message0430
   * @desc Recibe los msj 0430 en formato iso8583 de movistar, los guarda en la base de datos y a todos los msj reversos en la base de datos con trance number igual al msj 0430 se vinculan con dicho msj 0430
   * @borrows unpack_ISO, ISO8583, MTI0430, saveMessageDataBase, getReverseByRequestId, setIsoMessage0430
   * @param {string} message msj 0430 en formato iso8583
   */
  private async message0430(message: string) {
    console.log("\nMensaje 0430 de MOVISTAR en formato ISO8583:");
    console.log(message);
    let newFieldes: { [key: string]: string } = unpack_ISO(message);
    console.log(newFieldes);
    let mti0430 = new ISO8583(new MTI0430());
    mti0430.setFields(newFieldes, "0430");
    await saveMessageDataBase(mti0430.getMti(), mti0430.getTrancenr(), message);
    getReverseByRequestId(mti0430.getTrancenr()).then(async (reverses) => {
      if (reverses.length != 0) {
        reverses.forEach(async (reverse: any) => {
          if (reverse.isomessage430_id == null) {
            let id_message0430 = await saveMessageDataBase(
              mti0430.getMti(),
              mti0430.getTrancenr(),
              mti0430.getMessage()
            );
            await setIsoMessage0430(reverse.id, id_message0430);
          }
        });
      }
    });
  }
  /**
   * @module Movistar
   * @function message0800
   * @desc Guarda msj 0800 de movistar en formato iso8583 en base de datos y envia respuesta 0810 a movistar en formato iso8583
   * @borrows unpack_ISO, ISO8583, MTI0800, saveMessageDataBase, sendMessage0810
   * @param {string} message
   */
  private async message0800(message: string) {
    console.log("\nMensaje 0800 de MOVISTAR en formato ISO8583:");
    console.log(message);
    let newFieldes: { [key: string]: string } = unpack_ISO(message);
    console.log("\nData elements de msj 0800 de Movistar: ");
    console.log(newFieldes);
    let mti0800 = new ISO8583(new MTI0800());
    mti0800.setFields(newFieldes, "0800");
    await saveMessageDataBase(
      mti0800.getMti(),
      mti0800.getSystemTraceAuditNumber(),
      message
    );
    this.sendMessage0810();
  }
  /**
   * @function sendMessage0810
   * @desc Guarda msj 0810 en la base de datos y envia msj 0810 en formato iso8583 de respuesta a Movistar
   * @borrows ISO8583, MTI0810, saveMessageDataBase
   * @todo Los campos data elements enviados en el msj echo siempre estan hardcodeados, aclarar esto
   */
  private async sendMessage0810() {
    let dataElements_0810 = {
      TransmissionDateTime: TransmissionDateTime(),
      SystemsTraceAuditNumber: "032727", // HARDCODEADO?
      ResponseCode: "00",
      NetworkManagementInformationCode: "301",
    };
    let mti0810 = new ISO8583(new MTI0810());
    mti0810.setFields(dataElements_0810, "0810");
    await saveMessageDataBase(
      mti0810.getMti(),
      mti0810.getSystemTraceAuditNumber(),
      mti0810.getMessage()
    );
    console.log(`\nMensaje echo 0810 a Movistar: ${mti0810.getMessage()}`);
    this.socket.write(mti0810.getMessage(), "utf8");
  }
}

export { Movistar };
