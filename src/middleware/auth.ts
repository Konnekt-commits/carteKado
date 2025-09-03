
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '@/utils/ErrorHandler'
import jwt, { JwtPayload } from 'jsonwebtoken'
import * as process from 'node:process'
import { redis } from '@/utils/redis'
import {CatchAsyncError} from "@/middleware/catchAsyncError"

// authenticate user
export const isAuthenticated = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token
    if (!access_token) {
        next(new ErrorHandler('Please login to access this resource', 401))
        return
    }
    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload
    if (!decoded) {
        next(new ErrorHandler('access token not valid', 400))
        return
    }

    const user = await redis.get(`user:${ decoded.id }`)

    if (!user) {
        next(new ErrorHandler('login to access this resource', 400))
        return
    }
    req.user = JSON.parse(user)
    next()
})
