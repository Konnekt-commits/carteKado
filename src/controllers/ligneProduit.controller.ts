import {CatchAsyncError} from "@/middleware/catchAsyncError"
import {NextFunction, Request, Response} from "express"
import ErrorHandler from "@/utils/ErrorHandler"

import CarteRepository from "@/repository/carte.repository"
import ProduitRepository from "@/repository/produit.repository"
import {TypeValeur} from "@/customTypes"
import LigneProduitRepository from "@/repository/ligneProduit.repository"
import LigneProduit from "@/models/ligneProduit.model"
import Logging from "@/libraries/logging"

export const createLigneProduit = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Ligne Produits']*/
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Add ligne produit',
            schema: { $ref: '#/definitions/Ligne'}
          }
    */
    try {
        const { id_carte, id_produit, quantite } = req.body

        if ( [id_carte, id_produit, quantite].some(el => el == null) ) {
            next(new ErrorHandler(`id_carte, id_produit, quantite, can not be nullable`, 400))
            return
        }

        if (quantite <= 0) {
            next(new ErrorHandler(` quantite, can not be zero`, 400))
            return
        }

        const isCarteExist = await CarteRepository.findOneByID(id_carte)
        const isProduitExist = await ProduitRepository.findOneByID(id_produit)
        if (!isProduitExist || !isCarteExist) {
            next(new ErrorHandler('Product or carte not found', 400))
            return
        }
        if (isCarteExist.type_valeur !== TypeValeur.PAN_PRODUITS) {
            next(new ErrorHandler('cannot add product into carte type ==>Montant<==', 400))
            return
        }

        const price_ttc = isProduitExist?.prix_ttc ?? 0
        const montant_restant = isCarteExist?.montant_restant ?? 0

        const carteValue: number =  price_ttc * quantite

        if(carteValue > montant_restant) {
            next(new ErrorHandler(`product value is greeter than carte value.the value of carte is: ${montant_restant}`, 400))
            return
        }
        const newMontant = montant_restant - carteValue
        const newcarte = {...isCarteExist, montant_restant:newMontant}
        const affected = await CarteRepository.update(newcarte)

        Logging.info(`affecteed carte rows is: ${affected} and carte value is: ${carteValue}/${montant_restant}`)
        const ligneData = {id_carte, id_produit, quantite } as LigneProduit
        const ligneProduit = await LigneProduitRepository.save(ligneData)

        res.status(201).json({
            success: true,
            ligneProduit
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const updateLigneProduit = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Ligne Produits']*/
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'update ligne produit',
            schema: { $ref: '#/definitions/Ligne'}
          }
    */
    try {

        const data = req.body


        res.status(201).json({
            success: true,
            data,
            message: 'ligne update successfully'
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const AllLigneProduits = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Ligne Produits']*/
    try {
        const ligneProduits = await LigneProduitRepository.find({})
        res.status(201).json({
            success: true,
            ligneProduits
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const ligneProduittInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Ligne Produits']*/
    try {
        const id_produit = parseInt(req.query.produit as string, 10)
        const id_carte = parseInt(req.query.carte as string, 10)
        if(!id_produit || !id_carte) {
            next(new ErrorHandler(`please in query define produit and carte`, 400))
            return
        }
        const ligneProduit = await LigneProduitRepository.findOneByID({id_carte, id_produit})
        res.status(201).json({
            success: true,
            ligneProduit
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const deleteLigneProduit = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Ligne Produits']*/
    try {
        const id_produit = parseInt(req.query.produit as string, 10)
        const id_carte = parseInt(req.query.carte as string, 10)

        if(!id_produit || !id_carte) {
            next(new ErrorHandler(`please in query define produit and carte`, 400))
            return
        }
        const ligne = await LigneProduitRepository.findOneByID({id_carte, id_produit})
        if (!ligne) {
            next(new ErrorHandler('LigneProduit not found', 404))
            return
        }
        await LigneProduitRepository.delete({id_carte, id_produit})

        res.status(201).json({
            success: true,
            message: "Client deleted successfully"
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})
