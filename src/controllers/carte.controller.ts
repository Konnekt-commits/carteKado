import {CatchAsyncError} from "@/middleware/catchAsyncError"
import {NextFunction, Request, Response} from "express"
import ErrorHandler from "@/utils/ErrorHandler"
import EntrepriseRepository from "@/repository/entreprise.repository"
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
import UserRepository from "@/repository/user.repository"
import {validateCarteKadoData} from "@/helpers/carte.helper"
import Invite from "@/models/invite.model"
import Client from "@/models/client.model"
import LigneProduit from "@/models/ligneProduit.model"
import LigneProduitRepository from "@/repository/ligneProduit.repository"

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
        const { montant_initial, expire, produits, couleur} = req.body

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
        const isClientExist = await ClientRepository.findOne({email: invite.email})
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
                type_valeur: TypeValeur.PAN_PRODUITS,
                montant_restant: 0,
                couleur,
                date_emission: new Date,
                date_expiration: expires_date,
                statut: Status.ACTIVE
            } as Carte
            carte = await CarteRepository.save(carteData)
            await Promise.all(
                produits.map(async (produit: { id: number, quantite?: number }) =>{
                    const lineData = {
                        id_carte: carte?.id_carte ?? 0,
                        id_produit: produit.id,
                        quantite: produit.quantite ?? 1
                    } as LigneProduit
                    await LigneProduitRepository.save(lineData)
                })
            )
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

    const data = req.body
    // const affectedRows = await CarteRepository.update(newClient)

    // if( affectedRows === 0) {
    //     next(new ErrorHandler('Something went wrong! affected rows number is 0', 404))
    //     return
    // }
    //
    // res.status(201).json({
    //     success: true,
    //     affectedRows,
    //     message: 'client is successfully update'
    // })

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
                const client = await ClientRepository.findOneByID(carte.id_client ?? 0)
                const entreprise = await EntrepriseRepository.retrieveById(carte.id_entreprise ?? 0)
                const invite = await InviteRepository.findOneByID(carte.id_invite ?? 0)
                const user = await UserRepository.findOneByID(carte.id_user_createur ?? 0)
                delete user.hash_mot_de_passe
                delete carte.id_user_createur
                delete carte.id_invite
                delete carte.id_entreprise
                delete carte.id_client
                return {
                    ...carte,
                    client,
                    entreprise,
                    invite,
                    user
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
    res.status(201).json({
        success: true,
        carte
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
