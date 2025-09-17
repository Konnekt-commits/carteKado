import {CatchAsyncError} from "@/middleware/catchAsyncError"
import {NextFunction, Request, Response} from "express"
import ErrorHandler from "@/utils/ErrorHandler"
import EntrepriseRepository from "@/repository/entreprise.repository"
import Reglage from "@/models/reglage.model"
import ReglageRepository from "@/repository/reglage.repository"
import LigneReglageRepository from "@/repository/ligneReglage.repository";
import ProduitRepository from "@/repository/produit.repository";
import LigneReglage from "@/models/ligneReglage.model";
import Produit from "@/models/produit.model";

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
    /*  #swagger.tags = ['Reglage']*/
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
    /*  #swagger.tags = ['Reglage']*/
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
    /*  #swagger.tags = ['Reglage']*/
    try {
        const id = parseInt(req.params.id, 10)
        const reglage = await ReglageRepository.findOneByID(id)

        if (!reglage) {
            next(new ErrorHandler('Reglage not found', 404))
            return
        }
        const lignes = await LigneReglageRepository.find({
            id_reglage: id
        })
        const produits = await Promise.all(
            lignes.map(async (ligne) =>{
                return await ProduitRepository.findOneByID(ligne.id_produit)
            })
        )
        const data = {
            ...reglage,
            produits
        }
        res.status(201).json({
            success: true,
            reglage: data
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const reglageAddProduct = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Reglage']*/
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Update reglage',
            schema: { $ref: '#/definitions/IProduit'}
          }
    */
    try {
        const id = parseInt(req.params.id, 10)
        const {id_produit, produit} = req.body
        if (!id_produit && !produit) {
            next(new ErrorHandler('no data found to perform action', 404))
            return
        }

        const reglage = await ReglageRepository.findOneByID(id)
        if (!reglage) {
            next(new ErrorHandler('Reglage not found', 404))
            return
        }
        const user = req?.user
        if (id_produit) {
            const isProduitExist = await ProduitRepository.findOneByID(id_produit)
            if (!isProduitExist) {
                next(new ErrorHandler('Product not found', 404))
                return
            }
            const ligne = {
                id_reglage: id,
                id_produit
            } as LigneReglage
            await LigneReglageRepository.save(ligne)
            res.status(201).json({
                success: true,
                message: 'Product is add successfuly to the setting'
            })
            return
        }
        if (!produit) {
            next(new ErrorHandler('please provide product to add by id or by product feature', 404))
            return
        }
        if ( [ produit.nom, produit.prix_ttc].some(el => el == null) ) {
            next(new ErrorHandler(`nom, or prix_ttc, can not be nullable`, 400))
            return
        }
        const data = {
            ...produit,
            id_entreprise: user?.id_entreprise,
            actif: true
        } as Produit
        const p = await ProduitRepository.save(data)
        const line_data = {
            id_reglage: id,
            id_produit: p.id_produit
        } as LigneReglage
        const newLine = await LigneReglageRepository.save(line_data)
        res.status(201).json({
            success: true,
            message: 'new  product is added successfully!'

        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const deleteReglage = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Reglage']*/
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
