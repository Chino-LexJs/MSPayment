/**
 * Base de datos
 * @module DataBase
 */
import { pool } from "./db";

async function getRequestById(id: number): Promise<any> {
  try {
    let res: any = await pool.query(`SELECT * FROM request WHERE id = ${id}`);
    return res[0];
  } catch (error) {
    console.log(error);
  }
}
async function saveRequest(
  date_request: Date,
  time_request: Date,
  ip: string,
  account_id: number,
  pos_id: number,
  pos_name: string,
  pos_state: string,
  postimezona: number,
  posdate: Date,
  postime: Date,
  dnb: string,
  amount: number,
  productgroup: string,
  product_nr: number,
  responsecode: number,
  authorizationnr: number,
  error: number,
  action: number
): Promise<any> {
  try {
    let res: any = await pool.query(
      "INSERT INTO request (date_request, time_request, ip, account_id, pos_id, pos_name, pos_state, postimezona, posdate, postime, dnb, amount, productgroup, product_nr, responsecode, authorizationnr, error, action) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        date_request,
        time_request,
        ip,
        account_id,
        pos_id,
        pos_name,
        pos_state,
        postimezona,
        posdate,
        postime,
        dnb,
        amount,
        productgroup,
        product_nr,
        responsecode,
        authorizationnr,
        error,
        action,
      ]
    );
    return res[0].insertId;
  } catch (error) {
    console.log(error);
  }
}
async function setResponseDataRequest(
  request_id: number,
  responsedate: Date,
  responsetime: Date
): Promise<any> {
  try {
    let res: any = await pool.query(
      `UPDATE request SET responsedate = ?, responsetime = ? WHERE id=${request_id};`,
      [responsedate, responsetime]
    );
    return res[0];
  } catch (error) {
    console.log(error);
  }
}
async function setReverse_idRequest(
  request_id: number,
  reverse_id: number
): Promise<any> {
  try {
    let res: any = await pool.query(
      `UPDATE request SET reverse_id = ? WHERE id=${request_id};`,
      [reverse_id]
    );
    return res[0];
  } catch (error) {
    console.log(error);
  }
}

export {
  getRequestById,
  saveRequest,
  setResponseDataRequest,
  setReverse_idRequest,
};
