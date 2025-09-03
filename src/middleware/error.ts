import ErrorHandler from '@/utils/ErrorHandler'
import { NextFunction, Request, Response } from 'express'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ErrorMiddleware = (error: any  , req: Request, res: Response, next: NextFunction) => {
    error.statusCode = error.statusCode || 500
    error.message = error.message || 'Internal server error'

    // Validation error
    if (error.name === 'ValidationError') {
        const message = `Violation: ${error.message}`
        error = new ErrorHandler(message, 400)
    }

    // wrong mongodb id error
    if (error.name === 'CastError') {
        const message = `Resource not found. Invalid: ${error.path}`
        error = new ErrorHandler(message, 400)
    }

    // Duplicate key errors
    if (error.statusCode === 11000) {
        const message = `Duplicate ${ Object.keys(error.keyValue) } entered`
        error = new ErrorHandler(message, 400)
    }

    // wrong jwt error
    if (error.name === 'JsonWebTokenError') {
        const message = 'Json Web Token is invalid, try again'
        error = new ErrorHandler(message, 400)
    }

    // jwt expired error
    if (error.name === 'TokenExpiredError') {
        const message = 'Json Web Token is expired, try again'
        error = new ErrorHandler(message, 400)
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message
    })
}
