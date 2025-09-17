import {CatchAsyncError} from "@/middleware/catchAsyncError"
import {NextFunction, Request, Response} from "express"
import ErrorHandler from "@/utils/ErrorHandler"

import {redis} from "@/utils/redis"
import EntrepriseRepository from "@/repository/entreprise.repository"
import Reglage from "@/models/reglage.model";
import ReglageRepository from "@/repository/reglage.repository";

export const createReglage = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Reglage']*/
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Add Reglage',
            schema: { $ref: '#/definitions/Reglage'}
          }
    */
    try {
        const dataBody = req.body
        const { id_entreprise, nom_boutique} = req.body

        if ( [id_entreprise, nom_boutique].some(el => el == null) ) {
            next(new ErrorHandler(`id_entreprise, nom_boutique, can not be nullable`, 400))
            return
        }

        const isEntrepiseExist = await EntrepriseRepository.retrieveById(id_entreprise)
        if (!isEntrepiseExist) {
            next(new ErrorHandler('Try to perform existing entreprise', 400))
            return
        }

        const data = {
            ...dataBody,
            liste_montants: dataBody.liste_montants ? dataBody.liste_montants : '25,30,50,75,100'
        } as Reglage

        const reglage = await ReglageRepository.save(data)
        res.status(201).json({
            success: true,
            reglage
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const updateReglage = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Reglages']*/
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Update reglage',
            schema: { $ref: '#/definitions/Reglage'}
          }
    */
    try {

        const data = req.body

        const id = parseInt(req.params.id, 10)
        const isReglagetExist = await ReglageRepository.findOneByID(id)

        if(!isReglagetExist) {
            next(new ErrorHandler('Reglage not found', 404))
            return
        }

        const newReglage = {
            ...isReglagetExist,
            ...data
        } as Reglage

        const affectedRows = await ReglageRepository.update(newReglage)

        if( affectedRows === 0) {
            next(new ErrorHandler('Something went wrong! affected rows number is 0', 404))
            return
        }

        res.status(201).json({
            success: true,
            affectedRows,
            message: 'Reglage is successfully updated'
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const AllReglagesByEntreprise = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Reglages']*/
    try {
        const reglages = await ReglageRepository.find({})
        res.status(201).json({
            success: true,
            reglages
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const reglageInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Produits']*/
    try {
        const id = parseInt(req.params.id, 10)
        const reglage = await ReglageRepository.findOneByID(id)
        res.status(201).json({
            success: true,
            reglage
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const deleteReglage = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Produits']*/
    try {
        const id = parseInt(req.params.id, 10)
        const reglage = await ReglageRepository.findOneByID(id)
        if (!reglage) {
            next(new ErrorHandler('reglage not found', 404))
            return
        }
        await ReglageRepository.delete(id)

        res.status(201).json({
            success: true,
            message: "Reglage deleted successfully"
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})
