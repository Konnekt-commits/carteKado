import { NextFunction, Request, Response } from 'express'
import {CatchAsyncError} from "@/middleware/catchAsyncError"
import ErrorHandler from "@/utils/ErrorHandler"

const emailRegexPatten = /^((?:[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~]|(?<=^|\.)"|"(?=$|\.|@)|(?<=".)[ .](?=.*")|(?<!\.)\.){1,64})(@)([A-Za-z0-9.-]*[A-Za-z0-9]\.[A-Za-z0-9]{2,})$/

export const isValidEmail = CatchAsyncError(async (req: Request, res: Response, next: NextFunction)=> {
    const email_facturation = req.body.email_facturation
    const email = req.body.email
    if (email_facturation && !emailRegexPatten.test(email_facturation)) {
        next(new ErrorHandler('please enter the validate email facturation', 401))
        return
    }
    if (email && !emailRegexPatten.test(email)) {
        next(new ErrorHandler('please enter the validate email', 401))
        return
    }
    next()
})
