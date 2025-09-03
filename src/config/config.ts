import * as dotenv from 'dotenv'
import * as process from 'node:process'

dotenv.config()

// mysql config
const MYSQL_DATABASE = process.env.MYSQL_DATABASE ?? ''
const MYSQL_USERNAME = process.env.MYSQL_USERNAME ?? ''
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD ?? ''
const MYSQL_HOST = process.env.MYSQL_HOST ?? 'localhost'
// const MYSQL_PORT = process.env.MYSQL_PORT ?? 3306

// server config
const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1337
const ORIGIN = process.env.ORIGIN ? process.env.ORIGIN : ['http://localhost:3000']

// redis config
const REDIS_HOST = process.env.REDIS_HOST ?? 'localhost'
const REDIS_PORT = process.env.REDIS_PORT ?? 6379
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? ''
const REDIS_URL = process.env.REDIS_URL ?? ''
const REDIS_URL_LOCAL = `redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`

export const config = {
    mysql: {
        HOST: MYSQL_HOST,
        USER: MYSQL_USERNAME,
        PASSWORD: MYSQL_PASSWORD,
        DB: MYSQL_DATABASE
    },
    server: {
        port: SERVER_PORT,
        origin: ORIGIN
    },
    redis_conf: {
        url: process.env.NODE_ENV === 'development' ? REDIS_URL_LOCAL : REDIS_URL
    }
}
