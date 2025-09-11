import {CatchAsyncError} from "@/middleware/catchAsyncError"
import {NextFunction, Request, Response} from "express"
import ErrorHandler from "@/utils/ErrorHandler"
import {redis} from "@/utils/redis"
import {validateCarteModeleData} from "@/helpers/carteModele.helper";
import CarteModele from "@/models/carteModel.model";
import CarteModeleRepository from "@/repository/carteModele.repository";

export const createCarteModele = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Cartes Modele']*/
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Create new Carte Model',
            schema: { $ref: '#/definitions/CarteModel'}
          }
    */
    try {
        const dataBody = req.body
        validateCarteModeleData(dataBody)
        const data = dataBody as CarteModele
        const carteModele = await CarteModeleRepository.save(data)
        res.status(201).json({
            success: true,
            carteModele
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const updateCarteModele = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Cartes Modele']*/
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Update Carte Model',
            schema: { $ref: '#/definitions/CarteModel'}
          }
    */
    try {

        const dataBody = req.body
        validateCarteModeleData(dataBody)

        const id = parseInt(req.params.id, 10)
        const isCarteModeleExist = await CarteModeleRepository.findOneByID(id)

        if(!isCarteModeleExist) {
            next(new ErrorHandler('Carte Modele not found', 404))
            return
        }

        const newCarteModele: CarteModele = { ...isCarteModeleExist, ...dataBody}
        const affectedRows = await CarteModeleRepository.update(newCarteModele)

        if( affectedRows === 0) {
            next(new ErrorHandler('Something went wrong! affected rows number is 0', 400))
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

export const AllCarteModeles = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Cartes Modele']*/
    try {
        const carteModele = await CarteModeleRepository.find({})
        res.status(201).json({
            success: true,
            carteModele
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const CarteModeleInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Cartes Modele']*/
    try {
        const id = parseInt(req.params.id, 10)
        const carteModele = await CarteModeleRepository.findOneByID(id)
        res.status(201).json({
            success: true,
            carteModele
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const deleteCarteModele = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Cartes Modele']*/
    try {
        const id = parseInt(req.params.id, 10)
        const carteModele = await CarteModeleRepository.findOneByID(id)
        if (!carteModele) {
            next(new ErrorHandler('Carte modele not found', 404))
            return
        }
        await CarteModeleRepository.delete(id)
        await redis.del(`carte_model:${id}`)
        await redis.del('allCarteModeles')

        res.status(201).json({
            success: true,
            message: "Carte Modele deleted successfully"
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})
