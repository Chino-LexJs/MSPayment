import { pool } from "./db";

export async function addRetrie(
  reverse_id: number,
  cantRetries: number
): Promise<any> {
  try {
    let res: any = await pool.query(
      `UPDATE reverse SET retries = ${cantRetries} WHERE id=${reverse_id};`
    );
    console.log(res[0]);
    return res[0];
  } catch (error) {
    console.log(error);
  }
}
