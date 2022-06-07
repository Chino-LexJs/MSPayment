import { addRetrie, getMessageById, getReverses } from "../db";
import { MTI0800 } from "../lib";
import { TransmissionDateTime, unpack_ISO } from "../util";
import { socketMovistar } from "./connectMovistar";
import { saveMessageDataBase } from "./saveMessage";

function sendMessagesReverses(reverses: any[]) {
  reverses.forEach(async (reverse: { [key: string]: string | number }) => {
    let mti0420: any = await getMessageById(Number(reverse.isomessage420_id));
    console.log("\nMensaje 0420 a Movistar:");
    console.log(mti0420.message.toString());
    console.log(unpack_ISO(mti0420.message));
    socketMovistar.write(mti0420.message.toString(), "utf8");
    await addRetrie(Number(reverse.id), Number(reverse.retries) + 1);
  });
}
async function loopReverses() {
  let reverses = await getReverses(); // mensajes reversos con isomessage430_id IS NULL [{reverse1}, {reverse2}...]
  console.log(
    `\nBuscando Reverses...\nSe encontraron: ${reverses.length} mensajes reversos sin respuesta 0430`
  );
  sendMessagesReverses(reverses);
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

export { loopEcho, loopReverses };
