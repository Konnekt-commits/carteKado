import {CatchAsyncError} from "@/middleware/catchAsyncError"
import {Request, Response,NextFunction} from "express"
import ErrorHandler from "@/utils/ErrorHandler"
import EntrepriseRepository from "@/repository/entreprise.repository"
import Entreprise from "@/models/entreprise.model"
import Logging from "@/libraries/logging"

export interface IEntrepriseBody {
    raison_sociale: string
    siren: string
    adresse_facturation: string
    tva_intracom?: string
    email_facturation: string
}

export const createEntreprise = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Entreprises']*/
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Create Entreprise',
            schema: { $ref: '#/definitions/Entreprise'}
          }
    */
    try {
        const { raison_sociale, siren, adresse_facturation, email_facturation, tva_intracom} = req.body as IEntrepriseBody

        if ( [raison_sociale, siren, adresse_facturation, email_facturation].some(el => el == null) ) {
            next(new ErrorHandler(`siren, adresse_facturation, can not be nullable`, 400))
            return
        }
        if (siren.length !== 9) {
            next(new ErrorHandler(`siren must be 9 characters`, 400))
            return
        }
        const isSirenExist = await EntrepriseRepository.retrieveBySiren(siren)

        if (isSirenExist) {
            next(new ErrorHandler('Siren always exist.', 400))
            return
        }
        const data: Entreprise = {
            raison_sociale,
            siren,
            adresse_facturation,
            email_facturation,
            tva_intracom
        } as Entreprise
        const entreprise = await EntrepriseRepository.save(data)
        res.status(201).json({
            success: true,
            entreprise
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const retrieveEntrepriseByID = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Entreprises']*/
    try {
        const id_entreprise = parseInt(req.params.id, 10)
        const entreprise = await EntrepriseRepository.retrieveById(id_entreprise)
        if(!entreprise) {
            next(new ErrorHandler('Entreprise not found', 404))
            return
        }
        res.status(201).json({
            success: true,
            entreprise
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const retrieveAllEntreprises = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Entreprises']*/
    try {
        Logging.info('Not implement')
        const entreprises = await EntrepriseRepository.find({})
        res.status(201).json({
            status: true,
            entreprises
        })
    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})
