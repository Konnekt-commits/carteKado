import * as mysql from 'mysql2'
import {config} from "@/config/config"

const dbConnection = mysql.createPool({
    host: config.mysql.HOST,
    user: config.mysql.USER,
    password: config.mysql.PASSWORD,
    database: config.mysql.DB
})

export default dbConnection
