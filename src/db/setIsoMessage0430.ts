import { pool } from "./db";

export async function setIsoMessage0430(
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
