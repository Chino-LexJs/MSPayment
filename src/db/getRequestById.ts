import { pool } from "./db";

export async function getRequestById(id: number): Promise<any> {
  try {
    let res: any = await pool.query(`SELECT * FROM request WHERE id = ${id}`);
    return res[0];
  } catch (error) {
    console.log(error);
  }
}
