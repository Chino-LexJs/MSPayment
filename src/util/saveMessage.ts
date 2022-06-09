import { saveMessage } from "../db";

export async function saveMessageDataBase(
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
