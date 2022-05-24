import { pool } from "./db";

export async function saveMessage(
  date: Date,
  time: Date,
  type: number,
  messagedate: Date,
  messagetime: Date,
  tracenr: number,
  message: string
): Promise<any> {
  try {
    let res: any = await pool.query(
      "INSERT INTO message (date, time, type, messagedate, messagetime, tracenr, message) VALUES (?,?,?,?,?,?,?)",
      [date, time, type, messagedate, messagetime, tracenr, message]
    );
    return res[0].insertId;
  } catch (error) {
    console.log(error);
  }
}
/**
  * date DATE NOT NULL,
    time TIME NOT NULL,
    type INT(10) NOT NULL,
    messagedate DATE NOT NULL,
    messagetime TIME NOT NULL,
    tracenr INT(10) NOT NULL,
    message VARCHAR(512) NOT NULL
  */
