"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
require("dotenv").config();
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT } = process.env;
const promise_1 = require("mysql2/promise");
// create the connection to database
const pool = (0, promise_1.createPool)({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: 3306,
    database: DB_NAME,
});
exports.pool = pool;
