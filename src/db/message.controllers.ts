/**
 * Base de datos
 * @module DataBase
 */

import { pool } from "./db";

/**
 * @module DataBase
 * @function getMessage
 * @desc devuelve el mensaje guardado en la base de datos segun el trace number enviado por parametro
 * @param {number} tracenr es el System Trace Audit Number (P-11) y Retrieval Reference Number (P-37)
 * @returns {Promise<any>}
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
/**
 * @module DataBase
 * @function getMessageById
 * @desc devuelve el mensaje guardado en la base de datos segun el id por parametro
 * @param {number} id id del mensaje almacenado en la base de datos
 * @returns {Promise<any>}
 */
async function getMessageById(id: number): Promise<any> {
  try {
    let res: any = await pool.query(`SELECT * FROM message WHERE id = ${id}`);
    return res[0][0];
  } catch (error) {
    console.log(error);
  }
}
/**
 * @module DataBase
 * @function saveMessage
 * @desc almacena un mesaje en la base de datos dado los parametros
 * @param {Date} date
 * @param {Date} time
 * @param {number} type
 * @param {Date} messagedate
 * @param {Date} messagetime
 * @param {number} tracenr
 * @param {string} message
 * @returns {Promise<any>}
 */
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
