import { pool } from "./db";

export async function getReverses(): Promise<any> {
  try {
    let res: any = await pool.query(
      `SELECT * FROM reverse WHERE isomessage430_id IS NULL`
    );
    return res[0];
  } catch (error) {
    console.log(error);
  }
}
