import {NextFunction, Request, Response} from 'express'
import {CatchAsyncError} from "@/middleware/catchAsyncError"
import ErrorHandler from "@/utils/ErrorHandler"
import {
    checkOTPRestrictions,
    sendOTP,
    trackOTPRequests,
    validateRegistrationData,
    verifyOTP
} from "@/helpers/auth.helper"
import bcrypt from 'bcryptjs'
import UserRepository from "@/repository/user.repository"
import EntrepriseRepository from "@/repository/entreprise.repository"
import User from "@/models/user.model"
import {Roles} from "@/customTypes"
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import process from "node:process"
import {setCookie} from "@/utils/cookies/setCookies"
import Logging from "@/libraries/logging"
import { redis } from '@/utils/redis'
import {RedisKey} from "ioredis"

export const userRegistration = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Users']*/
    try {
        validateRegistrationData(req.body)
        const { id_entreprise, email} = req.body
        const existingUser = await UserRepository.findOne({email})

        if (existingUser) {
             next(new ErrorHandler('User already exists with this email', 401))
            return
        }

        const isEntrepriseExist = await EntrepriseRepository.retrieveById(id_entreprise)
        if (!isEntrepriseExist) {
            next(new ErrorHandler('Entreprise not exist', 401))
            return
        }

        const name = isEntrepriseExist.siren ? isEntrepriseExist.siren : isEntrepriseExist.raison_sociale

        await checkOTPRestrictions(email, email)
        await trackOTPRequests(email, next)
        await sendOTP(name ?? 'unknow entreprise', email, 'auth/welcome')

        res.status(201).json({
            success: true,
            message: 'OTP sent to email. Please verify your account!'
        })

    }catch (err: unknown) {
        const error = err as Error
        next(error)
    }
})

export const verifyUser = async (req:Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Users']*/
    try {
        const { email, otp, password, id_entreprise, role} = req.body
        if (!email || !otp || !password || !id_entreprise) {
            return  next(new ErrorHandler('All fields are required!', 400))
        }
        const existingUser = await UserRepository.findOne({email})
        if (existingUser) {
            return next(new ErrorHandler('User already exists with this email!', 401))
        }
        await verifyOTP(email, otp)

        const hashedPassword = await bcrypt.hash(password, 12)

        const data = {
            id_entreprise,
            email,
            hash_mot_de_passe: hashedPassword,
            role: role ? role : Roles.EMPLOYER,
            actif: false,
            derniere_connexion: new Date()
        } as User

        const user = await UserRepository.save(data)
        delete user.hash_mot_de_passe
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user
        })
    }catch (error) {
        return next(error)
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Users']*/
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return next(new ErrorHandler('Email and Password are required', 401))
        }

        const user = await UserRepository.findOne({email})
        if (!user) return next(new ErrorHandler("user doesn't exists!", 401))

        // check password
        const isMatch = await bcrypt.compare(password, user.hash_mot_de_passe!)
        if (!isMatch) {
            return next(new ErrorHandler('Invalid email or password', 400))
        }

        // generate access and refresh token
        const accessTokenExpiresIn = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '15')
        const refreshTokenExpiresIn = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '3')
        const accessToken = jwt.sign(
            {id: user.id_user, role:Roles.EMPLOYER},
            process.env.ACCESS_TOKEN as string,
            {
                expiresIn: accessTokenExpiresIn * 60 * 1000
            }
        )
        const refreshToken = jwt.sign(
            {id: user.id_user, role:Roles.EMPLOYER},
            process.env.REFRESH_TOKEN as string,
            {
                expiresIn: refreshTokenExpiresIn * 24 * 60 * 60 * 1000
            }
        )
        user.derniere_connexion = new Date()

        const affectedRows = await UserRepository.update(user)
        // store the refresh and access token in an httpOnly secure cookies
        setCookie(res, 'refresh_token', refreshToken)
        setCookie(res, 'access_token', accessToken)
        delete user.hash_mot_de_passe
        // upload session to redis
        redis.set(<RedisKey> `user:${ user.id_user }`, JSON.stringify(user) as any)
        res.status(200).json({
            success: true,
            affectedRows,
            message: 'Login successful!',
            user
        })
    }catch (error) {
        return next(error)
    }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Users']*/
    try {
        const refreshToken = req.cookies.refresh_token
        if(!refreshToken) {
            return  next(new ErrorHandler('Unauthorized! No refresh token.', 400))
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN as string
        ) as { id:string, role: string }

        if (!decoded || !decoded.id || !decoded.role) {
            const error =  new JsonWebTokenError('Forbidden! Invalid refresh token.')
            Logging.info(`enter in condition ${decoded.role}`)
            return next(new ErrorHandler(error.message, 400))

        }
        const userExist = await UserRepository.findOne({id_user: decoded.id})

        if (!userExist) {
            return new ErrorHandler('Forbidden! User not found', 400)
        }
        const accessTokenExpiresIn = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '15')

        const newAccessToken = jwt.sign(
            {id: decoded.id, role: decoded.role},
            process.env.ACCESS_TOKEN as string,
            {
                expiresIn: accessTokenExpiresIn * 60 * 1000
            }
        )

        setCookie(res, 'access_token', newAccessToken)

        return res.status(201).json({ success: true})
    } catch (error) {
        return next(error)
    }
}

export const getUser = async (req:Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Users']*/
    try {
        const user = req.user
        res.status(201).json({
            success: true,
            user
        })
    } catch (error) {
        next(error)
    }
}

export const updatePassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Users']*/
    try {
        const { oldPassword, newPassword } = req.body
        if (!oldPassword || !newPassword) {
            next(new ErrorHandler('Please enter old and new password', 400))
            return
        }
        const user = await UserRepository.findOne({id_user:req.user?.id_user})

        if (user?.hash_mot_de_passe === undefined) {
            next(new ErrorHandler('Invalid user', 400))
            return
        }
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.hash_mot_de_passe!)
        if (!isPasswordMatch) {
            next(new ErrorHandler('Invalid old password', 400))
            return
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        user.hash_mot_de_passe = hashedPassword
        await UserRepository.update(user)
        res.status(201).json({
            success: true,
            message: 'User Password updated successfully'
        })
    }catch (error: any) {
        next(new ErrorHandler(error.message, 400))
        return
    }
})

const minimizeFirstLetter = (val: string| undefined) => {
    return String(val).charAt(0).toLowerCase() + String(val).slice(1)
}
// validate user role
export const authorizeRoles = (role: Roles) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (role !== minimizeFirstLetter(req.user?.role) || '') {
            next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resource`, 403))
            return
        }
        next()
    }
}

// Logout user
export const logoutUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    /*  #swagger.tags = ['Users']*/
    try {
        res.cookie('access_token', '', {maxAge: 1})
        res.cookie('refresh_token', '', {maxAge: 1})

        const userId = req.user?.id_user || ''
        redis.del(userId as string)
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        })
    }catch (error: any) {
        next(new ErrorHandler(error.message, 400))
        return
    }
})
