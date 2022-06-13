import { pool } from "./db";

async function addRetrie(
  reverse_id: number,
  cantRetries: number
): Promise<any> {
  try {
    let res: any = await pool.query(
      `UPDATE reverse SET retries = ${cantRetries} WHERE id=${reverse_id};`
    );
    return res[0];
  } catch (error) {
    console.log(error);
  }
}
async function getReverseByRequestId(id: number): Promise<any> {
  try {
    let res: any = await pool.query(
      `SELECT * FROM reverse WHERE request_id = ${id}`
    );
    return res[0];
  } catch (error) {
    console.log(error);
  }
}
async function getReverses(): Promise<any> {
  try {
    let res: any = await pool.query(
      `SELECT * FROM reverse WHERE isomessage430_id IS NULL`
    );
    return res[0];
  } catch (error) {
    console.log(error);
  }
}
async function saveReverse(
  date: Date,
  time: Date,
  request_id: number,
  isomessage420_id: number,
  responsecode: number,
  referencenr: number,
  retries: number
): Promise<any> {
  try {
    let res: any = await pool.query(
      "INSERT INTO reverse (date, time, request_id, isomessage420_id, responsecode, referencenr, retries) VALUES (?,?,?,?,?,?,?)",
      [
        date,
        time,
        request_id,
        isomessage420_id,
        responsecode,
        referencenr,
        retries,
      ]
    );
    return res[0].insertId;
  } catch (error) {
    console.log(error);
  }
}
async function setIsoMessage0430(
  reverse_id: number,
  id_message0430: number
): Promise<any> {
  try {
    let res: any = await pool.query(
      `UPDATE reverse SET isomessage430_id = ${id_message0430} WHERE id=${reverse_id};`
    );
    return res[0];
  } catch (error) {
    console.log(error);
  }
}

export {
  addRetrie,
  getReverseByRequestId,
  getReverses,
  saveReverse,
  setIsoMessage0430,
};
