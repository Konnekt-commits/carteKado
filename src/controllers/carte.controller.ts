import {CatchAsyncError} from "@/middleware/catchAsyncError"
import {NextFunction, Request, Response} from "express"
import ErrorHandler from "@/utils/ErrorHandler"
import ClientRepository from "@/repository/client.repository"
import {redis} from "@/utils/redis"
import {v4 as uuidv4} from 'uuid'
import InviteRepository from "@/repository/invite.repository"
import Carte from "@/models/carte.model"
import CarteRepository from "@/repository/carte.repository"
import Email from "@/models/email.model"
import {Status, StatusEmail, TypeDestination, TypeValeur} from "@/customTypes"
import EmailRepository from "@/repository/email.repository"
import {sendEmail} from "@/utils/sendEmail/sendMail"
import {validateCarteKadoData} from "@/helpers/carte.helper"
import Invite from "@/models/invite.model"
import Client from "@/models/client.model"
import {
    addProductService,
    CarteEnhanceCarteService,
    deleteProductCarteService,
    getAllProductsByCarteService
} from "@/services/carte.service"

export const createCarteCadeau = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Cartes']*/
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Create new CarteKado',
            schema: { $ref: '#/definitions/Carte'}
          }
    */
    try {
        const dataBody = req.body
        const user = req?.user
        validateCarteKadoData(dataBody)
        const { montant_initial, expire, produits, couleur, message} = req.body

        // expires date
        const expires_date = new Date()
        const currentDay = expires_date.getDate()
        expires_date.setDate(currentDay + expire)

        // create invite
        const {invite} = req.body
        const isInviteExist = await InviteRepository.findOne({email: invite.email})
        const inviteData = isInviteExist
            ? isInviteExist
            : await InviteRepository.save({nom: invite.sobriquet, email: invite.email} as Invite)

        // create client
        const {client} = req.body
        const isClientExist = await ClientRepository.findOne({email: client.email})
        const clientData = isClientExist
            ? isClientExist
            : await ClientRepository.save({nom: client.sobriquet, email: client.email, id_entreprise: user?.id_entreprise} as Client)

        let carte: Carte | undefined = undefined

        if (montant_initial) {
            // Case 1: it is carteValue type
            const carteData = {
                id_entreprise: user?.id_entreprise,
                id_client: clientData.id_client,
                id_invite: inviteData.id_invite,
                id_user_createur: user?.id_user,
                code: uuidv4(),
                message: message,
                type_valeur: TypeValeur.MONTANT,
                montant_initial: montant_initial,
                montant_restant: montant_initial,
                couleur,
                date_emission: new Date,
                date_expiration: expires_date,
                statut: Status.ACTIVE
            } as Carte
            carte = await CarteRepository.save(carteData)
        }
        if (produits) {
            // Case 2: it is product package type
            const carteData = {
                id_entreprise: user?.id_entreprise,
                id_client: clientData.id_client,
                id_invite: inviteData.id_invite,
                id_user_createur: user?.id_user,
                code: uuidv4(),
                message: message,
                type_valeur: TypeValeur.PAN_PRODUITS,
                montant_restant: 0,
                couleur,
                date_emission: new Date,
                date_expiration: expires_date,
                statut: Status.ACTIVE
            } as Carte
            carte = await CarteRepository.save(carteData)
            await addProductService(produits, carte.id_carte ?? 0)
        }

    const newEmail= {
        id_carte: carte?.id_carte
,            dest_type: TypeDestination.CLIENT,
        dest_email: clientData.email,
        template_code: 'template code',
        date_envoi: new Date(),
        statut: StatusEmail.ENVOYER
    } as Email
    await EmailRepository.save(newEmail)
    const addressToSendEmail = inviteData.email ?? 'idrisstafo9@gmail.com'
    await sendEmail(addressToSendEmail, 'Nouvelle Card Cadeau', 'cadeau/notication', {
        username: inviteData.nom,
        name: clientData.nom,
        type: carte?.type_valeur,
        expires: carte?.date_expiration
    })

    res.status(201).json({
        success: true,
        carte
    })

}catch (err: unknown) {
    const error = err as Error
    next(error)
}
})

export const updateCarteCadeau = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Cartes']*/
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Update existing CarteKado',
            schema: { $ref: '#/definitions/Carte'}
          }
    */
    try {
        const dataBody = req.body
        validateCarteKadoData(dataBody)
        const { montant_initial, expire, produits, couleur, message} = req.body

        // check if carte exist
        const id = parseInt(req.params.id, 10)
        const isCarteExist = await CarteRepository.findOneByID(id)

        if (!isCarteExist) {
            next(new ErrorHandler('Carte not found', 404))
            return
        }
        if (expire) {
            isCarteExist.date_expiration?.setDate(isCarteExist.date_emission?.getDate() + expire)
        }
        const current_type = isCarteExist.type_valeur
        const new_type_value = montant_initial
            ? isCarteExist.type_valeur !== TypeValeur.MONTANT ? TypeValeur.MONTANT : isCarteExist.type_valeur
            : isCarteExist.type_valeur !== TypeValeur.PAN_PRODUITS ?TypeValeur.PAN_PRODUITS: isCarteExist.type_valeur

        const newCarteData = {
            message: message ? message : isCarteExist.message,
            type_valeur: new_type_value,
            montant_initial: new_type_value === TypeValeur.MONTANT ? montant_initial : null,
            montant_restant: new_type_value === TypeValeur.MONTANT ? montant_initial : 0,
            couleur: couleur ? couleur : isCarteExist.couleur
        }

        const affected_row_carte = await CarteRepository.update({...isCarteExist, ...newCarteData})
        if( affected_row_carte === 0) {
            next(new ErrorHandler('Something went wrong! affected rows number is 0', 400))
            return
        }

        // delete product if type change
        if (new_type_value === TypeValeur.PAN_PRODUITS || (current_type === TypeValeur.PAN_PRODUITS && new_type_value === TypeValeur.MONTANT)) {
            await deleteProductCarteService(isCarteExist.id_carte ?? 0)
        }

        // add product
        if (produits) {
            await addProductService(produits, isCarteExist.id_carte ?? 0)
        }

        // update client
        const {client} = req.body
        const id_client = isCarteExist.id_client
        const oldClient = await ClientRepository.findOneByID(id_client ?? 0)
        const client_affected_rows = await ClientRepository.update({
            ...oldClient,
            email: client.email,
            nom: client.sobriquet
        })

        if( client_affected_rows === 0) {
            next(new ErrorHandler('For Client update, Something went wrong! affected rows number is 0', 400))
            return
        }

        // update invite
        const {invite} = req.body
        const id_invite = isCarteExist.id_invite
        const oldInvite = await InviteRepository.findOneByID(id_invite ?? 0)
        const invite_affected_rows = await InviteRepository.update({
            ...oldInvite,
            email: invite.email,
            nom: invite.sobriquet
        })

        if( invite_affected_rows === 0) {
            next(new ErrorHandler('For Invite update, Something went wrong! affected rows number is 0', 400))
            return
        }

        const newEmail= {
            id_carte: isCarteExist?.id_carte
            ,            dest_type: TypeDestination.CLIENT,
            dest_email: client.email,
            template_code: 'template code',
            date_envoi: new Date(),
            statut: StatusEmail.ENVOYER
        } as Email
        await EmailRepository.save(newEmail)
        const addressToSendEmail = invite.email ?? 'idrisstafo9@gmail.com'
        if(addressToSendEmail !== oldInvite.email){
            await sendEmail(addressToSendEmail, 'Nouvelle Card Cadeau', 'cadeau/notication', {
                username: invite.nom,
                name: client.nom,
                type: newCarteData?.type_valeur,
                expires: isCarteExist?.date_expiration
            })
        }

        res.status(201).json({
            status: true,
            message: 'Carte is successfully update'
        })

        }catch (err: unknown) {
            const error = err as Error
            next(error)
        }
})

export const AllCartes = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Cartes']*/
    try {
        const cartes = await CarteRepository.find({})

        const responses = await Promise.all(cartes
            .map(async (carte) => {
                const produits = await getAllProductsByCarteService(carte)
                const carteEnhance = await CarteEnhanceCarteService(carte)
                return {
                    ...carteEnhance,
                    produits,
                }
            }))
        res.status(201).json({
            success: true,
            cartes: responses
        })

}catch (err: unknown) {
    const error = err as Error
    next(error)
}
})

export const CarteInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Cartes']*/
    try {
        const carteID = parseInt(req.params.id, 10)
        const carte = await CarteRepository.findOneByID(carteID)
        if (!carte) {
            next(new ErrorHandler('Carte not found', 404))
            return
        }
        const produits = await getAllProductsByCarteService(carte)
        const carteEnhance = await CarteEnhanceCarteService(carte)
        res.status(201).json({
            success: true,
            carte: {
                ...carteEnhance,
                produits
            }
        })

}catch (err: unknown) {
    const error = err as Error
    next(error)
}
})

export const deleteCarte = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Cartes']*/
    try {
    const id = parseInt(req.params.id, 10)
    const carte = await CarteRepository.findOneByID(id)
    if (!carte) {
        next(new ErrorHandler('Carte not found', 404))
        return
    }
    await CarteRepository.delete(id)
    await redis.del(`carte:${id}`)
    await redis.del('allCartes')

    res.status(201).json({
        success: true,
        message: "carte deleted successfully"
    })

}catch (err: unknown) {
    const error = err as Error
    next(error)
}
})
