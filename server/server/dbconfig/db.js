require("dotenv").config()
const mysql = require('mysql2')
const connection = mysql.createPool({
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "user": process.env.DB_USER,
    "password": process.env.DB_PW,
    "database": process.env.DB_DB,
    waitForConnections: true,
    enableKeepAlive: true
})
module.exports = connection