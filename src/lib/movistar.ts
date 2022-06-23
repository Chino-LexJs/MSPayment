/**
 * Clases para distintos mensajes en formato ISO 8583
 * @module Lib
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
import { MTI0210 } from "./MTI_0210";
import { MTI0420 } from "./MTI_0420";
import { MTI0430 } from "./MTI_0430";
import { MTI0800 } from "./MTI_0800";
import { MTI0810 } from "./MTI_0810";

const { Socket } = require("net");
const to_MOVISTAR = {
  host: "localhost",
  port: 8000,
};

/**
 * Clase para crear Movistar
 * Contiene la conexion socket a moviestar y el comportamiento de los msj entrantes y salientes
 */
class Movistar {
  private connecting: boolean;
  private socket: any;
  private tiempoRespuesta: number = 55;

  /**
   * Esta clase tiene un constructor sin parametros */
  constructor() {
    this.connecting = false;
  }
  /**
   * Establece conexion socket a Movistar
   * @returns {void}
   */
  public connect(): void {
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
   * Devuelve la conexion socket a Movistar
   * @returns {any} Socket con conexion a Movistar
   */
  public getSocket(): any {
    return this.socket;
  }
  /**
   *
   * @param {string} PosPreauthorizationChargebackData contiene Product Number, DNB y Product Group
   * @returns {string} Product Number
   */
  private getProductNr(PosPreauthorizationChargebackData: string): string {
    return PosPreauthorizationChargebackData.substr(24, 4);
  }
  /**
   * Configura el estado de conectado, se usa cuando se desconecta o se conecta la instancia a movistar
   * @param {boolean} state estado de conectado(true) o desconectado (false)
   */
  private setConnecting(state: boolean): void {
    this.connecting = state;
  }
  /**
   * Funcion que sirve para enviar msj 0810 de echo a movistar
   * @param {MTI0810} mti0800 mensaje 0810
   */
  private async sendMessage0810(mti0800: MTI0800) {
    let dataElements_0810 = {
      TransmissionDateTime: TransmissionDateTime(),
      SystemsTraceAuditNumber: "032727",
      ResponseCode: "00",
      NetworkManagementInformationCode: "301",
    };
    let mti0810 = new MTI0810(dataElements_0810, "0810");
    await saveMessageDataBase(
      mti0810.getMti(),
      mti0810.getSystemTraceAuditNumber(),
      mti0810.getMessage()
    );
    console.log(`\nMensaje echo 0810 a Movistar: ${mti0800.getMessage()}`);
    this.socket.write(mti0810.getMessage(), "utf8");
  }
  /**
   * Funcion que sirve para enviar msj 0420 a movistar y generar un elemento reverso en la tabla de reversos de la DB
   * @param mti0210 mensaje 0210 que se usa para el armado de msj 0420
   */
  private async sendMessage0420(mti0210: MTI0210) {
    let fields0420: { [key: string]: string } = {};
    let fields0210 = mti0210.getFields();
    const SE_USA = 3;
    const VALOR = 4;
    // Los parametros que se envian en el msj 0420 son similares al 0210 por lo que se copian los valores
    for (const key in fields0210) {
      if (fields0210[key][SE_USA]) {
        fields0420[key] = fields0210[key][VALOR].toString();
      }
    }
    let mti0420 = new MTI0420(fields0420, "0420");
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
   * Funcion que contiene la logica de negocios para los mensajes de tipo 0210 etrantes de Movistar
   * @param {string} message msj 0210 en formato iso8583
   */
  private async message0210(message: string) {
    console.log("\nMensaje 0210 de MOVISTAR en formato ISO8583:");
    console.log(message);
    let newFieldes: { [key: string]: string } = unpack_ISO(message);
    console.log("\nData elements de msj 0210 de Movistar: ");
    console.log(newFieldes);
    let mti0210 = new MTI0210(newFieldes, "0210");
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
        mti0210.getMessage()
      );
      /**
       * Se busca entre las distintas conexiones que se establecieron con RCES y se envia la respuesta 0210 a la conexion correspondiente
       */
      if (findConnection(mti0210.getTrancenr())) {
        sendMessageConnection(mti0210.getTrancenr(), mti0210.getMessage());
        console.log("\nMensaje que se envia a RCES en formato RCES");
        console.log(mti0210.getMessage());
      } else {
        console.log("\nNo se encontro cliente, se envia msj 0420 a Movistar");
        this.sendMessage0420(mti0210);
      }
    }
  }
  /**
   * Funcion que contiene la logica de negocios para los mensajes de tipo 0430 etrantes de Movistar
   * @param {string} message msj 0430 en formato iso8583
   */
  private async message0430(message: string) {
    console.log("\nMensaje 0430 de MOVISTAR en formato ISO8583:");
    console.log(message);
    let newFieldes: { [key: string]: string } = unpack_ISO(message);
    console.log(newFieldes);
    let mti0430 = new MTI0430(newFieldes, "0430");
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
   * Funcion que contiene la logica de negocios para los mensajes de tipo 0800 etrantes de Movistar
   * @param {string} message
   */
  private async message0800(message: string) {
    console.log("\nMensaje 0800 de MOVISTAR en formato ISO8583:");
    console.log(message);
    let newFieldes: { [key: string]: string } = unpack_ISO(message);
    console.log("\nData elements de msj 0800 de Movistar: ");
    console.log(newFieldes);
    let mti0800 = new MTI0800(newFieldes, "0800");
    await saveMessageDataBase(
      mti0800.getMti(),
      mti0800.getSystemTraceAuditNumber(),
      message
    );
    this.sendMessage0810(mti0800);
  }
  /**
   * Funcion que sirve para recuperar el tipo de msj ISO8583
   * Precondiciones: La trama message debe tener el mti en los primeros 4 caracteres
   * @param {string} message Mensaje ISO 8583 de Movistar
   * @returns {string} mti type of message ej: 0200, 0210, 0430, 0800, 0810
   */
  private getMti(message: string): string {
    return message.substr(0, 4);
  }
  /**
   * Funcion que sirve para determinar la logica a usar dependiendo el msj entrante de Movistar
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
}

export { Movistar };
