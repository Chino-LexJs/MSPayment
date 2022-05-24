import { pool } from "./db";

export async function saveRequest(
  date_request: Date,
  time_request: Date,
  ip: number,
  account_id: number,
  pos_id: number,
  pos_name: string,
  pos_state: string,
  postimezona: number,
  posdate: Date,
  postime: Date,
  dnb: string,
  amount: number,
  productgroup: string,
  product_nr: number,
  responsedate: Date,
  responsetime: Date,
  responsecode: number,
  authorizationnr: number,
  error: number,
  action: number,
  reverse_id: number
): Promise<any> {
  try {
    let res: any = await pool.query(
      "INSERT INTO request (date_request, time_request, ip, account_id, pos_id, pos_name, pos_state, postimezona, posdate, postime, dnb, amount, productgroup, product_nr, responsedate, responsetime, responsecode, authorizationnr, error, action, reverse_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        date_request,
        time_request,
        ip,
        account_id,
        pos_id,
        pos_name,
        pos_state,
        postimezona,
        posdate,
        postime,
        dnb,
        amount,
        productgroup,
        product_nr,
        responsedate,
        responsetime,
        responsecode,
        authorizationnr,
        error,
        action,
        reverse_id,
      ]
    );
    return res[0].insertId;
  } catch (error) {
    console.log(error);
  }
}
/**
 * id INT AUTO_INCREMENT NOT NULL,
    date_request date NOT NULL,
    time_request time NOT NULL,
    ip INT NOT NULL,
    account_id INT NOT NULL,
    pos_id INT NOT NULL,
    pos_name VARCHAR(22) NOT NULL,
    pos_state VARCHAR(3) NOT NULL,
    postimezona INT(3) NOT NULL,
    posdate DATE NOT NULL,
    postime TIME NOT NULL,
    dnb VARCHAR(10) NOT NULL,
    amount DOUBLE NOT NULL,
    productgroup VARCHAR(1),
    product_nr INT(6) NOT NULL,
    responsedate DATE NOT NULL,
    responsetime TIME NOT NULL,
    responsecode INT(6) NOT NULL,
    authorizationnr INT(6) NOT NULL,
    error INT(6) NOT NULL,
    action INT(3) NOT NULL,
    reverse_id INT(11),
 */
