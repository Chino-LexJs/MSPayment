import { pool } from "./db";

export async function getMessage(tracenr: number): Promise<any> {
  try {
    let res: any = await pool.query(
      `SELECT * FROM message WHERE tracenr = ${tracenr}`
    );
    console.log(res[0][0]);
    return res[0][0];
  } catch (error) {
    console.log(error);
  }
}
