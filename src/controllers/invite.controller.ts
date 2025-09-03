import {CatchAsyncError} from "@/middleware/catchAsyncError"
import {NextFunction, Request, Response} from "express"
import ErrorHandler from "@/utils/ErrorHandler"
import ClientRepository from "@/repository/client.repository"
import {redis} from "@/utils/redis"
import InviteRepository from "@/repository/invite.repository"
import inviteRepository from "@/repository/invite.repository"
import Invite from "@/models/invite.model"

export const createInvite = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, nom } = req.body

        if ( [email, nom].some(el => el == null) ) {
            next(new ErrorHandler(`email, or nom, can not be nullable`, 400))
            return
        }

        const data = {
            email,
            nom
        } as Invite

        const invite = await inviteRepository.save(data)
        res.status(201).json({
            success: true,
            invite
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const updateInvite = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const data = req.body

        const inviteID = parseInt(req.params.id, 10)
        const isInviteExist = await inviteRepository.findOneByID(inviteID)

        if(!isInviteExist) {
            next(new ErrorHandler('Invite not found', 404))
            return
        }

        const newInvite: Invite = {
            id_invite: isInviteExist.id_invite,
            email:data.email ? data.email : isInviteExist.email,
            nom: data.nom ? data.nom : isInviteExist.nom
        } as Invite

        const affectedRows = await inviteRepository.update(newInvite)

        if( affectedRows === 0) {
            next(new ErrorHandler('Something went wrong! affected rows number is 0', 404))
            return
        }

        res.status(201).json({
            success: true,
            affectedRows,
            message: 'invite is successfully update'
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const AllInvites = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const invites = await inviteRepository.find({})
        res.status(201).json({
            success: true,
            invites
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const InviteInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const inviteID = parseInt(req.params.id, 10)
        const client = await inviteRepository.findOneByID(inviteID)
        res.status(201).json({
            success: true,
            client
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const deleteInvite = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id, 10)
        const invite = await inviteRepository.findOneByID(id)
        if (!invite) {
            next(new ErrorHandler('invite not found', 404))
            return
        }
        await InviteRepository.delete(id)
        await redis.del(`invite:${id}`)
        await redis.del('allInvites')

        res.status(201).json({
            success: true,
            message: "Invite deleted successfully"
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})
