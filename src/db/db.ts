/**
 * Conexiones
 * @module DataBase
 */

require("dotenv").config();
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT } = process.env;
import { createPool } from "mysql2/promise";

/**
 * @module DataBase
 * @desc sirve para la conexion a la base de datos
 */
const pool = createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  port: 3306,
  database: DB_NAME,
});

export { pool };
