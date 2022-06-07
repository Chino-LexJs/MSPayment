import { rcesClients } from "../app";
import {
  getMessage,
  getReverseByRequestId,
  saveReverse,
  setIsoMessage0430,
  setResponseDataRequest,
  setReverse_idRequest,
} from "../db";
import { MTI0210, MTI0420, MTI0430, MTI0800, MTI0810 } from "../lib";
import { TransmissionDateTime, unpack_ISO } from "../util";
import { socketMovistar } from "./connectMovistar";
import { saveMessageDataBase } from "./saveMessage";

const TIEMPO_RESPUESTA_MOVISTAR = 55; // Tiempo (segundos) limite en el que puede responder Movistar

function getProductNr(PosPreauthorizationChargebackData: string): string {
  return PosPreauthorizationChargebackData.substr(24, 4);
}
async function sendMessage0810(mti0800: MTI0800) {
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
  socketMovistar.write(mti0810.getMessage(), "utf8");
}
async function sendMessage0420(mti0210: MTI0210) {
  let fields0420: { [key: string]: string } = {};
  let fields0210 = mti0210.getFields();
  const SE_USA = 3;
  const VALOR = 4;
  // Los parametros que se envian en el msj 0420 son similares al 0200 por lo que se copian los valores
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
  socketMovistar.write(mti0420.getMessage(), "utf8");
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

async function message0210(message: string) {
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
  if (difDates > TIEMPO_RESPUESTA_MOVISTAR) {
    // se envia msj 0420 y se genera un elemento reverso en la tabla de reversos de la DB
    sendMessage0420(mti0210);
  } else {
    // se guarda msj 0210 que se envia a RCES, se genera un msj 0210 para RCES y se envia msj a RCES
    mti0210.addYearLocalTransactionDate(jsonDate.year); // Se agrega el año del request almacenado en la db
    let fields0200: { [key: string]: string } = unpack_ISO(
      message0200.message.substr(12)
    );
    mti0210.setProduct_NR(
      getProductNr(fields0200.PosPreauthorizationChargebackData)
    );
    await saveMessageDataBase(
      mti0210.getMti(),
      mti0210.getTrancenr(),
      mti0210.getMessage()
    );
    /**
     * Se busca entre las distintas conexiones que se establecieron con RCES y se envia la respuesta 0210 a la conexion correspondiente
     */
    let client = rcesClients.has(mti0210.getTrancenr())
      ? rcesClients.get(mti0210.getTrancenr())
      : undefined;
    if (client != undefined) {
      client.write(mti0210.getMessage(), "utf8");
      console.log("\nMensaje que se envia a RCES en formato RCES");
      console.log(mti0210.getMessage());
      rcesClients.delete(mti0210.getTrancenr());
      client.end();
    } else {
      console.log("\nNo se encontro cliente, se envia msj 0420 a Movistar");
      sendMessage0420(mti0210);
    }
  }
}
async function message0430(message: string) {
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
async function message0800(message: string) {
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
  sendMessage0810(mti0800);
}

export { message0210, message0430, message0800 };
