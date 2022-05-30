import { pool } from "./db";

export async function getReverseByRequestId(id: number): Promise<any> {
  try {
    let res: any = await pool.query(
      `SELECT * FROM reverse WHERE request_id = ${id}`
    );
    return res[0];
  } catch (error) {
    console.log(error);
  }
}
