import {CatchAsyncError} from "@/middleware/catchAsyncError"
import {NextFunction, Request, Response} from "express"
import ErrorHandler from "@/utils/ErrorHandler"
import {redis} from "@/utils/redis"
import EmailRepository from "@/repository/email.repository"

export const createEmail = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        res.status(201).json({
            success: true
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const updateEmail = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const data = req.body

        res.status(201).json({
            success: true,
            data,
            message: 'client is successfully update'
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const AllEmails = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const emails = await EmailRepository.find({})
        res.status(201).json({
            success: true,
            emails
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const emailInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const emailID = parseInt(req.params.id, 10)
        const email = await EmailRepository.findOneByID(emailID)
        res.status(201).json({
            success: true,
            email
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const deleteEmail = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id, 10)
        const email = await EmailRepository.findOneByID(id)
        if (!email) {
            next(new ErrorHandler('Email not found', 404))
            return
        }
        await EmailRepository.delete(id)
        await redis.del(`email:${id}`)
        await redis.del('allEmails')

        res.status(201).json({
            success: true,
            message: "Email deleted successfully"
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})
