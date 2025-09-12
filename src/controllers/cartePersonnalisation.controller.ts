import {CatchAsyncError} from "@/middleware/catchAsyncError"
import {NextFunction, Request, Response} from "express"
import ErrorHandler from "@/utils/ErrorHandler"

import {validateCartePersonnalisationData} from "@/helpers/cartePersonnalisation.helper"
import CarteRepository from "@/repository/carte.repository"
import CarteModeleRepository from "@/repository/carteModele.repository"
import CartePersonnalisation from "@/models/cartePersonnalisation.model"
import CartePersonnalisationRepository from "@/repository/cartePersonnalisation.repository"
import ClientRepository from "@/repository/client.repository"

export const createCartePersonnalisation = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Personnalisation']*/
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Create Carte Personnalisation',
            schema: { $ref: '#/definitions/Personnalisation'}
          }
    */
    try {
        const dataBody = req.body
        validateCartePersonnalisationData(dataBody, false)
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
    /*  #swagger.tags = ['Personnalisation']*/
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Create Carte Personnalisation',
            schema: { $ref: '#/definitions/Personnalisation'}
          }
    */
    try {

        const dataBody = req.body
        validateCartePersonnalisationData(dataBody, true)

        const id = parseInt(req.params.id, 10)
        const isPersonnalisationExist = await CartePersonnalisationRepository.findOneByID(id)

        if(!isPersonnalisationExist) {
            next(new ErrorHandler('Personnalisation not found', 404))
            return
        }
        const { id_carte, id_modele } = req.body
        if (id_carte) {
            const carteExist = CarteRepository.findOneByID(id_carte)
            if(!carteExist) {
                next(new ErrorHandler('inconsistent carte id', 404))
                return
            }
        }
        if (id_modele) {
            const modelExist = CarteModeleRepository.findOneByID(id_modele)
            if(!modelExist) {
                next(new ErrorHandler('inconsistent model id', 404))
                return
            }
        }

        const newPersonnalisation = {
            ...isPersonnalisationExist,
            ...dataBody

        } as CartePersonnalisation

        const affectedRows = await CartePersonnalisationRepository.update(newPersonnalisation)

        if( affectedRows === 0) {
            next(new ErrorHandler('Something went wrong! affected rows number is 0', 404))
            return
        }

        res.status(201).json({
            success: true,
            affectedRows,
            message: 'Personalisation is successfully update'
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const AllCartePersonnalisation = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Personnalisation']*/
    try {
        const personnalisations = await CartePersonnalisationRepository.find({})
        res.status(201).json({
            success: true,
            personnalisations
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const cartePersonnalisationInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Personnalisation']*/
    try {
        const id = parseInt(req.params.id, 10)
        const personalisation = await CartePersonnalisationRepository.findOneByID(id)
        res.status(201).json({
            success: true,
            personalisation
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const deleteCartePersonnalisation = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Personnalisation']*/
    try {
        const id = parseInt(req.params.id, 10)
        const personnalisation = await CartePersonnalisationRepository.findOneByID(id)
        if (!personnalisation) {
            next(new ErrorHandler('personnalisation not found', 404))
            return
        }
        await CartePersonnalisationRepository.delete(id)

        res.status(201).json({
            success: true,
            message: "Personnalisation deleted successfully"
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})
