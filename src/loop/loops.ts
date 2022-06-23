/**
 * Distintas funciones loops del sistema
 * @module Loop
 */
import { movistar } from "../connection/movistar";
import { getReverses } from "../db/reverse.controllers";
import { MTI0800 } from "../lib";
import { TransmissionDateTime } from "../util";
import { saveMessageDataBase } from "../util/saveMessage";
import { sendReverseMessages } from "./reverseMessage";

async function loopReverses() {
  let reverses = await getReverses(); // mensajes reversos con isomessage430_id IS NULL [{reverse1}, {reverse2}...]
  console.log(
    `\nBuscando Reverses...\nSe encontraron: ${reverses.length} mensajes reversos sin respuesta 0430`
  );
  sendReverseMessages(reverses);
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
  movistar.getSocket().write(mti0800.getMessage(), "utf8");
}

export { loopEcho, loopReverses };
