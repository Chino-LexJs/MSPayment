import { pool } from "./db";

export async function setReverse_idRequest(
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
