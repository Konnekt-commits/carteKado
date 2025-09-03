import {CatchAsyncError} from "@/middleware/catchAsyncError"
import {NextFunction, Request, Response} from "express"
import ErrorHandler from "@/utils/ErrorHandler"
import EntrepriseRepository from "@/repository/entreprise.repository"
import Client from "@/models/client.model"
import ClientRepository from "@/repository/client.repository"
import {redis} from "@/utils/redis"
import {v4 as uuidv4} from 'uuid'
import InviteRepository from "@/repository/invite.repository"
import Carte from "@/models/carte.model"
import CarteRepository from "@/repository/carte.repository"
import Email from "@/models/email.model"
import {StatusEmail, TypeDestination} from "@/customTypes"
import EmailRepository from "@/repository/email.repository"
import {sendEmail} from "@/utils/sendEmail/sendMail"
import Logging from "@/libraries/logging"

export const createCarteCadeau = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body
        const constraints: string[] = ["id_entreprise",
            "id_client",
            "id_invite",
            "date_expiration",
            // "code",
            "type_valeur",
            "montant_restant",
            "statut"]
        const notDefine = constraints.filter(x => !Object.keys(data).includes(x) || x == null)
        Logging.info(new Date())
        if ( notDefine.length > 0) {
            next(new ErrorHandler(`${notDefine.join(',')}, can not be nullable`, 400))
            return
        }

        const isEntrepiseExist = await EntrepriseRepository.retrieveById(data.id_entreprise)
        const isInviteExist = await  InviteRepository.findOneByID(data.id_invite)
        const isClientExist = await  ClientRepository.findOneByID(data.id_client)
        if (!isEntrepiseExist || !isInviteExist || !isClientExist) {
            next(new ErrorHandler('Something went wrong! make sure that entreprise or invite or client exist', 400))
            return
        }

        const newData = {
            id_entreprise: data.id_entreprise,
            id_client: data.id_client,
            id_invite: data.id_invite,
            id_user_createur: req.user?.id_user,
            code: data.code ? data.code : uuidv4(),
            type_valeur: data.type_valeur,
            montant_initial: data.montant_initial ? data.montant_initial : undefined,
            montant_restant: data.montant_restant,
            couleur: data.couleur ? data.couleur : undefined,
            date_emission: new Date(),
            date_expiration: new Date(data.date_expiration),
            statut: data.statut

        } as Carte

        const carte = await CarteRepository.save(newData)
        const newEmail= {
            id_carte: carte.id_carte
,            dest_type: TypeDestination.CLIENT,
            dest_email: isClientExist.email,
            template_code: 'template code',
            date_envoi: new Date(),
            statut: StatusEmail.ENVOYER
        } as Email
        const email = await EmailRepository.save(newEmail)
        await sendEmail(isClientExist.email, 'Nouvelle Card Cadeau', 'cadeau/notication', {
            username: isClientExist.nom,
            name: isEntrepiseExist.raison_sociale,
            type: carte.type_valeur,
            valueInitial: carte.montant_initial,
            value: carte.montant_restant,
            expires: carte.date_expiration
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
    try {
        const cartes = await CarteRepository.find({})
        res.status(201).json({
            success: true,
            cartes
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const CarteInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
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
    try {
        const id = parseInt(req.params.id, 10)
        const carte = await CarteRepository.findOneByID(id)
        if (!carte) {
            next(new ErrorHandler('Carte not found', 404))
            return
        }
        await ClientRepository.delete(id)
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
