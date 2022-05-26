import { pool } from "./db";


/**
 * 
 * @param tracenr es el System Trace Audit Number (P-11) y Retrieval Reference Number (P-37)
 * @returns Devuelve el mensaje de la base de datos con el trancenr = {trancenr} enviado por parametro
 */
export async function getMessage(tracenr: number): Promise<any> {
  try {
    let res: any = await pool.query(
      `SELECT * FROM message WHERE tracenr = ${tracenr}`
    );
    return res[0][0];
  } catch (error) {
    console.log(error);
  }
}
