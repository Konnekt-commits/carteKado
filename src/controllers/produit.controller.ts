import {CatchAsyncError} from "@/middleware/catchAsyncError"
import {NextFunction, Request, Response} from "express"
import ErrorHandler from "@/utils/ErrorHandler"
import EntrepriseRepository from "@/repository/entreprise.repository"
import {redis} from "@/utils/redis"
import Produit from "@/models/produit.model"
import ProduitRepository from "@/repository/produit.repository";

export const createProduit = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id_entreprise, nom, prix_ttc, actif } = req.body

        if ( [id_entreprise, nom, prix_ttc].some(el => el == null) ) {
            next(new ErrorHandler(`id_entreprise, nom, or prix_ttc, can not be nullable`, 400))
            return
        }

        const isEntrepiseExist = await EntrepriseRepository.retrieveById(id_entreprise)
        if (!isEntrepiseExist) {
            next(new ErrorHandler('Try to perform existing entreprise', 400))
            return
        }

        const data = {
            id_entreprise,
            nom,
            prix_ttc,
            actif: actif ? actif : false
        } as Produit

        const produit = await ProduitRepository.save(data)
        res.status(201).json({
            success: true,
            produit
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const updateProduit = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const data = req.body

        const produitID = parseInt(req.params.id, 10)
        const isProduitExist = await ProduitRepository.findOneByID(produitID)

        if(!isProduitExist) {
            next(new ErrorHandler('Client not found', 404))
            return
        }

        const newProduit: Produit = {
            id_produit: isProduitExist.id_produit,
            id_entreprise: data.id_entreprise ? data.id_entreprise : isProduitExist.id_entreprise,
            nom: data.nom ? data.nom : isProduitExist.nom,
            prix_ttc: data.prix_ttc ? data.prix_ttc : isProduitExist.prix_ttc,
            actif: data.actif ? data.actif : isProduitExist.actif
        } as Produit

        const affectedRows = await ProduitRepository.update(newProduit)

        if( affectedRows === 0) {
            next(new ErrorHandler('Something went wrong! affected rows number is 0', 404))
            return
        }

        res.status(201).json({
            success: true,
            affectedRows,
            message: 'produit is successfully updated'
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const AllProduits = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const produits = await ProduitRepository.find({})
        res.status(201).json({
            success: true,
            produits
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const produitInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const produitID = parseInt(req.params.id, 10)
        const produit = await ProduitRepository.findOneByID(produitID)
        res.status(201).json({
            success: true,
            produit
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const deleteProduit = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id, 10)
        const produit = await ProduitRepository.findOneByID(id)
        if (!produit) {
            next(new ErrorHandler('Produit not found', 404))
            return
        }
        await ProduitRepository.delete(id)
        await redis.del(`produit:${id}`)
        await redis.del('allProduits')

        res.status(201).json({
            success: true,
            message: "Produit deleted successfully"
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})
