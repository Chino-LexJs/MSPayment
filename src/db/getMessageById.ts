import { pool } from "./db";

export async function getMessageById(id: number): Promise<any> {
  try {
    let res: any = await pool.query(`SELECT * FROM message WHERE id = ${id}`);
    console.log(res[0][0]);
    return res[0][0];
  } catch (error) {
    console.log(error);
  }
}
