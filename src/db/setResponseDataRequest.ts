import { pool } from "./db";

export async function setResponseDataRequest(
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
