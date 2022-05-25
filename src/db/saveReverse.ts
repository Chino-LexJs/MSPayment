import { pool } from "./db";

export async function saveReverse(
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
/**
 * date DATE NOT NULL,
    time TIME NOT NULL,
    request_id INT(10) NOT NULL,
    isomessage420_id INT(10) NOT NULL,
    isomessage430_id INT(10),
    responsecode INT(6) NOT NULL,
    referencenr INT(11) NOT NULL,
    retries INT(11) NOT NULL,
 */
