const mysql = require('mysql2/promise');
require('dotenv').config();

//khoi tao ket noi

const pool = mysql.createPool({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
});

module.exports = pool;
