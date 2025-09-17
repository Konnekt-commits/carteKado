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
import Logging from "@/libraries/logging";

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

interface IProduitBody {
    nom: string,
    prix_ttc: number
}
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
        const user = req?.user
        const id = parseInt(req.params.id, 10)
        const isReglagetExist = await ReglageRepository.findOneByID(id)

        if(!isReglagetExist) {
            next(new ErrorHandler('Reglage not found', 404))
            return
        }
        const produits = data.produits as IProduitBody[]
        delete data.produits
        delete data.id_reglage
        const validNumber = data.liste_montants.split(",").map(Number).filter(Boolean)

        const newReglage = {
            ...isReglagetExist,
            ...data,
            liste_montants: validNumber.join(',')
        } as Reglage

        const affectedRows = await ReglageRepository.update(newReglage)

        if( affectedRows === 0) {
            next(new ErrorHandler('Something went wrong! affected rows number is 0', 404))
            return
        }

        if (produits) {
            // delete all product
            const existingProducts = await LigneReglageRepository.find({
                id_reglage: id
            })
            Logging.info(existingProducts)
            const ids_ligne: number[] = []
            const ids_produits = existingProducts.map((lp) =>{
                ids_ligne.push(lp.id_ligne ?? 0)
                return lp.id_produit
            })

            if (ids_ligne.length > 0) {
                const affected = await LigneReglageRepository.deleteBatch(ids_ligne)
            }
            if (ids_produits.length > 0) {
                await ProduitRepository.deleteBatch(ids_produits)
            }

            if (produits.length === 0) {
                next(new ErrorHandler('List of product cannot be nullable', 404))
                return
            }
            await Promise.all(
                produits.map(async (p) =>{
                    const product_data = {
                        ...p,
                        id_entreprise: user?.id_entreprise,
                        actif: true
                    } as Produit
                    const newProduct =await ProduitRepository.save(product_data)
                    const new_line = {
                        id_reglage: id,
                        id_produit: newProduct.id_produit
                    } as LigneReglage
                    await LigneReglageRepository.save(new_line)
                })
            )
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
