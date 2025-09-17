import * as express from 'express'
import * as http from 'http'
import cors from 'cors'
import * as mysql from 'mysql2'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'

import {config} from './config/config'
import Logging from './libraries/logging'
import { ErrorMiddleware } from '@/middleware/error'

import entrepriseRoute from "@/routes/entreprise.route"
import userRoute from "@/routes/user.route"
import clientRoute from "@/routes/client.route"
import inviteRoute from "@/routes/invite.route"
import carteRoute from "@/routes/carte.route"
import emailRoute from "@/routes/email.route"
import produitRoute from "@/routes/produit.route"
import ligneProduitRoute from "@/routes/ligneProduit.route"
import carteModeleRoute from "@/routes/carteModele.route"
import personnalisationRoute from "@/routes/personnalisation.route"
import reglageRoute from "@/routes/reglage.route"

import swaggerDocument from "swagger-output.json"

//cloudinary config

const router = express()

/**
 * connect to mysql
 */
const connection = mysql.createConnection({
    host: config.mysql.HOST,
    user: config.mysql.USER,
    password: config.mysql.PASSWORD,
    database: config.mysql.DB
})
connection.connect((error) => {
    if (error) {
        Logging.error('Unable to connect to database')
        Logging.error(error as object)
    }
    Logging.info(`connected to mysql database as id ${connection.threadId}`)
    StartServer()
    redisClient()
})

/**
 * Redis connection
 * @returns  the url redis connection
 */
const redisClient = () => {
    if (config.redis_conf.url) {
        Logging.info('Redis Connected')
        return config.redis_conf.url
    }
    throw new Error('Redis Connection Failed')
}

/**
 * Only start the server if Mongo is connected
 */
const StartServer = () => {
    router.use((req, res, next) => {
        /** Log the request */
        Logging.info(`Incoming -> Method: [${ req.method }] - Url: [${ req.url }] - IP:[${ req.socket.remoteAddress?.toString() }]`)

        res.on('finish', () => {
            /** Log the response */
            Logging.info(`Incoming -> Method: [${ req.method }]
            - Url: [${ req.url }]
            - IP: [${ req.socket.remoteAddress?.toString() }]
            - Status: [${ res.statusCode.toString() }]`)
        })
        next()
    })
    router.use(express.urlencoded({ extended: true }))

    /** body parser */
    router.use(express.json({limit: '50mb'}))

    /** cookie parser */
    router.use(cookieParser())

    /** cors => cross-origin resource sharing */
    router.use(cors({
        origin: true,
        credentials: true
    }))

    /** Rules of our Api */
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'Origin, X-requested-With, Content-type,' +
            'Accept, Authorization')
        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET')
            res.status(200).json({})
        }
        next()
    })
    /** routes */
    router.use('/api/v1', entrepriseRoute)
    router.use('/api/v1', userRoute)
    router.use('/api/v1', clientRoute)
    router.use('/api/v1', inviteRoute)
    router.use('/api/v1', carteRoute)
    router.use('/api/v1', emailRoute)
    router.use('/api/v1', produitRoute)
    router.use('/api/v1', ligneProduitRoute)
    router.use('/api/v1', carteModeleRoute)
    router.use('/api/v1', personnalisationRoute)
    router.use('/api/v1', reglageRoute)

    /* doc swagger route*/
    router.use('/api-docs', swaggerUi.serve)
    router.get('/api-docs', swaggerUi.setup(swaggerDocument))

    /** healthCheck */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    router.get('/ping',(req, res, next) => {
        const param = req.body
        res.status(200).json({ message: `pong: ${param}` })
        return
    })

    /** Error handling */
    router.use((req,res,next) => {
        const error = new Error('not found')
        Logging.error(error)

        res.status(404).json({ message: error.message })
        next()
        return
    })

    router.use(ErrorMiddleware)
    // router.use(ErrorMiddleware)
    http.createServer(router).listen(config.server.port, () => {
        Logging.info(`
    Server is running on port ${ config.server.port.toString() }.`)
    })
}
