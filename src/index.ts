import {
  addRetrie,
  getMessage,
  getMessageById,
  getReverseByRequestId,
  getReverses,
  saveMessage,
  saveRequest,
  saveReverse,
  setIsoMessage0430,
  setResponseDataRequest,
  setReverse_idRequest,
} from "./db/index";
import {
  MTI0200,
  MTI0210,
  MTI0420,
  MTI0430,
  MTI0800,
  MTI0810,
} from "./lib/index";
import {
  TransmissionDateTime,
  util_unpack,
  util_unpack_ISO,
} from "./util/index";

// Constantes
const { Server, Socket } = require("net"),
  port = 3000,
  host = "0.0.0.0",
  to_MOVISTAR = {
    host: "localhost",
    port: 8000,
  },
  TIEMPO_RESPUESTA_MOVISTAR = 55, // Tiempo (segundos) limite en el que puede responder Movistar
  TIEMPO_LOOP_REVERSE = 30000, // Tiempo (milisegundos) para que el sistema envie reversos
  TIEMPO_LOOP_ECHO = 60000, // Tiempo (milisegundos) para que el sistema envie echo test 0800
  TIEMPO_CONEXION_RCES = 55000, // Tiempo (milisegundos) limite para conexion con socket RCES
  server = new Server();

// Variables Globales
let socketMovistar: any, // variable que contiene la conexion socket unica con Movistar
  /**
   * Map que guarda las distintas conexiones sockets de RCES de la siguiente forma
   * key: es el id de Request de RCES (P-11 y P-37)
   * valor: conexion socket
   * rcesClients: new Map() : key(id_request) => socket connection
   */
  rcesClients = new Map();

// Funciones
/**
 * Funcion que sirve para enviar msj reversos a MOVISTAR, segun el tiempo que se describa en la funcion setIinterval()
 */
async function loopReverses() {
  let reverses = await getReverses(); // mensajes reversos con isomessage430_id IS NULL [{reverse1}, {reverse2}...]
  console.log(
    `\nBuscando Reverses\nSe encontraron: ${reverses.length} mensajes reversos sin respuesta 0430`
  );
  reverses.forEach(async (reverse: { [key: string]: string | number }) => {
    let mti0420: any = await getMessageById(Number(reverse.isomessage420_id));
    console.log("\nMensaje 0420 a Movistar:");
    console.log(mti0420.message.toString());
    socketMovistar.write(mti0420.message.toString(), "utf8");
    await addRetrie(Number(reverse.id), Number(reverse.retries) + 1);
  });
}
async function loopEcho() {
  let dataElements_0800 = {
    TransmissionDateTime: TransmissionDateTime(),
    SystemsTraceAuditNumber: "032727",
    NetworkManagementInformationCode: "301",
  };
  let mti0800 = new MTI0800(dataElements_0800, "0800");
  await saveMessageDataBase(
    mti0800.getMti(),
    mti0800.getSystemTraceAuditNumber(),
    mti0800.getMessage()
  );
  console.log(`\nMensaje echo 0800 a Movistar: ${mti0800.getMessage()}`);
  socketMovistar.write(mti0800.getMessage(), "utf8");
}
function getProductNr(PosPreauthorizationChargebackData: string): string {
  return PosPreauthorizationChargebackData.substr(24, 4);
}
function posDate(dataUnpack: { [key: string]: string }): Date {
  return new Date(
    Number(dataUnpack.POS_DATE.substr(0, 4)),
    Number(dataUnpack.POS_DATE.substr(4, 2)),
    Number(dataUnpack.POS_DATE.substr(6))
  );
}
function posTime(dataUnpack: { [key: string]: string }): Date {
  return new Date(
    Number(dataUnpack.POS_DATE.substr(0, 4)),
    Number(dataUnpack.POS_DATE.substr(4, 2)),
    Number(dataUnpack.POS_DATE.substr(6)),
    Number(dataUnpack.POS_TIME.substr(0, 2)),
    Number(dataUnpack.POS_TIME.substr(2, 2)),
    Number(dataUnpack.POS_TIME.substr(4))
  );
}
async function saveMessageDataBase(
  type: string,
  trancenr: number,
  message: string
): Promise<number> {
  let valuesMessage = {
    date: new Date(),
    time: new Date(),
    type: Number(type),
    messagedate: new Date(), // P-7 se crea en el momento en TransmissionDateTime() en archivo util_propsToFields
    messagetime: new Date(), // P-7 se crea en el momento en TransmissionDateTime() en archivo util_propsToFields
    tracenr: Number(trancenr),
    message: message,
  };
  let id_message = await saveMessage(
    valuesMessage.date,
    valuesMessage.time,
    valuesMessage.type,
    valuesMessage.messagedate,
    valuesMessage.messagetime,
    valuesMessage.tracenr,
    valuesMessage.message
  );
  return id_message;
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
  let newFieldes: { [key: string]: string } = util_unpack_ISO(message);
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
    let fields0200: { [key: string]: string } = util_unpack_ISO(
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
  let newFieldes: { [key: string]: string } = util_unpack_ISO(message);
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
  let newFieldes: { [key: string]: string } = util_unpack_ISO(message);
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
async function messageFromRCES(
  message: string,
  ipClient: string
): Promise<number> {
  let dataUnpack: { [key: string]: string } = util_unpack(message);
  console.log("\nMensage de RCES deslozado: ");
  console.log(dataUnpack);
  console.log("\n");
  let posdate = posDate(dataUnpack);
  let postime = posTime(dataUnpack);
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
  dataUnpack.SYSTEMS_TRANCE = id_request.toString().slice(-6); // Si el numero supera los 6 digitos P-11 solo capta hasta 6 digitos
  dataUnpack.RETRIEVAL_REFERENCE_NUMBER = id_request.toString();
  let mti0200 = new MTI0200(dataUnpack, "0200");
  console.log("\nData elements generados por el msj 0200 de RCES:");
  console.log(mti0200.getFields());
  console.log(
    "\nMensaje 0200 en formato ISO8583 enviado a Movistar:\n",
    mti0200.getMessage()
  );
  socketMovistar.write(mti0200.getMessage(), "utf8");
  await saveMessageDataBase(
    mti0200.getMti(),
    mti0200.getTrancenr(),
    mti0200.getMessage()
  );
  return id_request;
}

/**
 * Funcion que genera conexion socket con Movistar
 */
function connectMovistar() {
  socketMovistar = new Socket();
  socketMovistar.connect(to_MOVISTAR);
  socketMovistar.setEncoding("utf8"); // se configura socket para manejar cadena de caracteres en el buffer[]
  socketMovistar.on("data", async (message: string) => {
    let mtiMessage = message.substr(0, 4);
    switch (mtiMessage) {
      case "0210":
        message0210(message);
        break;
      case "0430":
        message0430(message);
        break;
      case "0800":
        message0800(message);
      default:
        console.log("\nTipo de mensaje (MTI) no soportado por el Servidor");
        break;
    }
  });
  socketMovistar.on("close", () => {
    console.log(`\nComunicacion con MOVISTAR finalizada`);
    connectMovistar(); // Siempre debe intentar conectarse a Movistar
  });
  socketMovistar.on("error", (err: Error): void => {
    console.log(err);
  });
}

// Server Settings para distintas conexiones sockets de RCES
server.on("connection", (socket: any) => {
  console.log(
    `New connection from ${socket.remoteAddress} : ${socket.remotePort}`
  );
  socket.setEncoding("utf8"); // se configura socket para manejar cadena de caracteres en el buffer[]
  socket.on("data", async (message: string) => {
    console.log("\nMensaje de RCES sin formato: ");
    console.log(message, "\n");
    let id_request = await messageFromRCES(message, socket.remoteAddress);
    rcesClients.set(id_request, socket);
  });
  socket.on("close", () => {
    for (let client of rcesClients.keys()) {
      if (socket == rcesClients.get(client)) {
        rcesClients.delete(client);
      }
    }
    console.log(`\nComunicacion finalizada con RCS`);
  });
  // Don't forget to catch error, for your own sake.
  socket.on("error", function (err: Error) {
    console.log(`Error: ${err}`);
  });
  socket.setTimeout(TIEMPO_CONEXION_RCES);
  socket.on("timeout", () => {
    console.log("Connexion socket con RCES timeout");
    socket.end();
  });
});

// Start Server
server.listen({ port, host }, async () => {
  console.log(`Server on port: ${server.address().port}`);
  setInterval(loopReverses, TIEMPO_LOOP_REVERSE);
  setInterval(loopEcho, TIEMPO_LOOP_ECHO);
  connectMovistar();
});
