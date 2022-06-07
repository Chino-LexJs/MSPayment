import { saveRequest } from "../db";
import { MTI0200 } from "../lib";
import { unpack } from "../util";
import { socketMovistar } from "./connectMovistar";
import { saveMessageDataBase } from "./saveMessage";

function posDate(date: string): Date {
  return new Date(
    Number(date.substr(0, 4)),
    Number(date.substr(4, 2)),
    Number(date.substr(6))
  );
}
function posTime(date: string, time: string): Date {
  return new Date(
    Number(date.substr(0, 4)),
    Number(date.substr(4, 2)),
    Number(date.substr(6)),
    Number(time.substr(0, 2)),
    Number(time.substr(2, 2)),
    Number(time.substr(4))
  );
}
async function saveRequestMessage(
  dataUnpack: { [key: string]: string },
  ipClient: string
): Promise<any> {
  let posdate = posDate(dataUnpack.POS_DATE);
  let postime = posTime(dataUnpack.POS_DATE, dataUnpack.POS_TIME);
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
function addIdRquest(
  dataUnpack: { [key: string]: string },
  id_request: string
) {
  dataUnpack.SYSTEMS_TRANCE = id_request.toString().slice(-6); // Si el numero supera los 6 digitos P-11 solo capta hasta 6 digitos
  dataUnpack.RETRIEVAL_REFERENCE_NUMBER = id_request.toString();
}
export async function messageFromRCES(
  message: string,
  ipClient: string
): Promise<number> {
  let dataUnpack: { [key: string]: string } = unpack(message);
  console.log("\nMensage de RCES deslozado: ");
  console.log(dataUnpack);
  let id_request = await saveRequestMessage(dataUnpack, ipClient);
  addIdRquest(dataUnpack, id_request);
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
