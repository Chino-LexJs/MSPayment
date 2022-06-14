import { movistar } from "../connection/movistar";
import { getMessageById } from "../db/message.controllers";
import { addRetrie } from "../db/reverse.controllers";
import { unpack_ISO } from "../util";

function sendReverseMessages(reverses: any[]) {
  reverses.forEach(async (reverse: { [key: string]: string | number }) => {
    let mti0420: any = await getMessageById(Number(reverse.isomessage420_id));
    console.log("\nMensaje 0420 a Movistar:");
    console.log(mti0420.message.toString());
    console.log(unpack_ISO(mti0420.message));
    movistar.getSocket().write(mti0420.message.toString(), "utf8");
    await addRetrie(Number(reverse.id), Number(reverse.retries) + 1);
  });
}

export { sendReverseMessages };
