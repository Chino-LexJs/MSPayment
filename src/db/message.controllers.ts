/**
 * Base de datos
 * @module DataBase
 */

import { pool } from "./db";

/**
 *
 * @param tracenr es el System Trace Audit Number (P-11) y Retrieval Reference Number (P-37)
 * @returns Devuelve el mensaje de la base de datos con el trancenr = {trancenr} enviado por parametro
 */
async function getMessage(tracenr: number): Promise<any> {
  try {
    let res: any = await pool.query(
      `SELECT * FROM message WHERE tracenr = ${tracenr}`
    );
    return res[0][0];
  } catch (error) {
    console.log(error);
  }
}
async function getMessageById(id: number): Promise<any> {
  try {
    let res: any = await pool.query(`SELECT * FROM message WHERE id = ${id}`);
    return res[0][0];
  } catch (error) {
    console.log(error);
  }
}
async function saveMessage(
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
export { getMessage, getMessageById, saveMessage };
