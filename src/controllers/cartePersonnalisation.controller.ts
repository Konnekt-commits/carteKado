import {CatchAsyncError} from "@/middleware/catchAsyncError"
import {NextFunction, Request, Response} from "express"
import ErrorHandler from "@/utils/ErrorHandler"
import {redis} from "@/utils/redis"
import {validateCartePersonnalisationData} from "@/helpers/cartePersonnalisation.helper"
import CarteRepository from "@/repository/carte.repository"
import CarteModeleRepository from "@/repository/carteModele.repository"
import CartePersonnalisation from "@/models/cartePersonnalisation.model"
import CartePersonnalisationRepository from "@/repository/cartePersonnalisation.repository"
import ClientRepository from "@/repository/client.repository"
import Client from "@/models/client.model"

export const createCartePersonnalisation = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Client']*/
    try {
        const dataBody = req.body
        validateCartePersonnalisationData(dataBody)
        const { id_carte, id_modele } = req.body
        const id_c = parseInt(id_carte, 10)
        const id_m = parseInt(id_modele, 10)

        const isCarteExist = await CarteRepository.findOneByID(id_c)
        const isModeleExist = await CarteModeleRepository.findOneByID(id_m)

        if (!isCarteExist || !isModeleExist) {
            next(new ErrorHandler('Try to perform existing carte or model', 400))
            return
        }

        const data = dataBody as CartePersonnalisation

        const personnalisation = await CartePersonnalisationRepository.save(data)
        res.status(201).json({
            success: true,
            personnalisation
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const updateCartePersonnalisation = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Client']*/
    try {

        const data = req.body

        const clientID = parseInt(req.params.id, 10)
        const isClientExist = await ClientRepository.findOneByID(clientID)

        if(!isClientExist) {
            next(new ErrorHandler('Client not found', 404))
            return
        }

        const newClient = {
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

export const AllCartePersonnalisation = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Client']*/
    try {
        const clients = await ClientRepository.find({})
        res.status(201).json({
            success: true,
            clients
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const cartePersonnalisationInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Client']*/
    try {
        const clientID = parseInt(req.params.id, 10)
        const client = await ClientRepository.findOneByID(clientID)
        res.status(201).json({
            success: true,
            client
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const deleteCartePersonnalisation = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
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
