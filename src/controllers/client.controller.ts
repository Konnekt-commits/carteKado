import {CatchAsyncError} from "@/middleware/catchAsyncError"
import {NextFunction, Request, Response} from "express"
import ErrorHandler from "@/utils/ErrorHandler"
import EntrepriseRepository from "@/repository/entreprise.repository"
import Client from "@/models/client.model"
import ClientRepository from "@/repository/client.repository"
import clientRepository from "@/repository/client.repository"
import {redis} from "@/utils/redis"

export const createClient = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Client']*/
    try {
        const { id_entreprise, email, nom, adresse } = req.body

        if ( [id_entreprise, email, nom, adresse].some(el => el == null) ) {
            next(new ErrorHandler(`id_entreprise, email, nom, adresse, can not be nullable`, 400))
            return
        }

        const isEntrepiseExist = await EntrepriseRepository.retrieveById(id_entreprise)
        if (!isEntrepiseExist) {
            next(new ErrorHandler('Try to perform existing entreprise', 400))
            return
        }

        const data = {
            id_entreprise,
            email,
            nom,
            adresse
        } as Client

        const client = await ClientRepository.save(data)
        res.status(201).json({
            success: true,
            client
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const updateClient = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Client']*/
    try {

        const data = req.body

        const clientID = parseInt(req.params.id, 10)
        const isClientExist = await ClientRepository.findOneByID(clientID)

        if(!isClientExist) {
            next(new ErrorHandler('Client not found', 404))
            return
        }

        const newClient: Client = {
            id_client: isClientExist.id_client,
            id_entreprise: data.id_entreprise ? data.id_entreprise : isClientExist.id_entreprise,
            email:data.email ? data.email : isClientExist.email,
            nom: data.nom ? data.nom : isClientExist.nom,
            adresse: data.adresse ? data.adresse : isClientExist.adresse
        } as Client

        const affectedRows = await ClientRepository.update(newClient)

        if( affectedRows === 0) {
            next(new ErrorHandler('Something went wrong! affected rows number is 0', 404))
            return
        }

        res.status(201).json({
            success: true,
            affectedRows,
            message: 'client is successfully update'
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const AllClients = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Client']*/
    try {
        const clients = await clientRepository.find({})
        res.status(201).json({
            success: true,
            clients
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const ClientInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Client']*/
    try {
        const clientID = parseInt(req.params.id, 10)
        const client = await clientRepository.findOneByID(clientID)
        res.status(201).json({
            success: true,
            client
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const deleteClient = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Client']*/
    try {
        const id = parseInt(req.params.id, 10)
        const client = await ClientRepository.findOneByID(id)
        if (!client) {
            next(new ErrorHandler('Client not found', 404))
            return
        }
        await ClientRepository.delete(id)
        await redis.del(`client:${id}`)
        await redis.del('allClients')

        res.status(201).json({
            success: true,
            message: "Client deleted successfully"
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})
