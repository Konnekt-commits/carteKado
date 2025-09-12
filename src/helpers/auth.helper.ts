import ErrorHandler from "@/utils/ErrorHandler"
import {redis} from "@/utils/redis"
import {NextFunction} from "express"
import crypto from "crypto"
import {sendEmail} from "@/utils/sendEmail/sendMail"
const emailRegexPatten = /^((?:[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~]|(?<=^|\.)"|"(?=$|\.|@)|(?<=".)[ .](?=.*")|(?<!\.)\.){1,64})(@)([A-Za-z0-9.-]*[A-Za-z0-9]\.[A-Za-z0-9]{2,})$/
const passwordRegexPatten = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const validateRegistrationData = (data: any, update: boolean) => {
    const { id_entreprise, email} = data

    if(!update) {
        if ( [id_entreprise, email].some(el => el == null) ) {
            throw new ErrorHandler(`id_entreprise, email, and password can not be nullable`, 400)

        }
    }
    if (!emailRegexPatten.test(email)) {
        throw new ErrorHandler('Invalid email format!', 400)
    }
    // if (!passwordRegexPatten.test(hash_mot_de_passe)) {
    //     throw new ErrorHandler('Invalid password format!', 400)
    // }
}

export const checkOTPRestrictions = async (email: string, next: NextFunction) => {
    const otpLockExist = await redis.get(`otp_lock:${email}`)
    if (otpLockExist) {
        return next(new ErrorHandler('Account locked due to multiple failed attempts! Try again after 30 minutes', 401))
    }
    const spamLockExist = await redis.get(`otp_spam_lock:${email}`)
    if (spamLockExist) {
        return next(new ErrorHandler('Too many OTP requests! please wait 1hour before requesting again.', 401))
    }
    const otpCooldownExist = await redis.get(`otp_cooldown:${email}`)
    if (otpCooldownExist) {
        return next(new ErrorHandler('Too many OTP requests! please wait 1 minute before requesting new otp.', 401))
    }
}

export const trackOTPRequests = async (email: string, next: NextFunction) => {

    const otpRequestKey = `otp_request_count:${email}`
    const otpRequests = parseInt((await redis.get(otpRequestKey)) || '0')

    if (otpRequests >2) {
        await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600) // lock for 1 hour
        return next(new ErrorHandler('Too many OTP requests. Please wait 1 hour before requesting', 401))
    }

    await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600) // track request for 1 hour

}

export const sendOTP = async (name: string, email:string, template: string) => {
    const otp = crypto.randomInt(100000, 999999).toString()
    await sendEmail(email, 'Activate Your account', template, { name, otp})
    await redis.set(`otp:${email}`, otp, 'EX', 900)
    await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60)
    //
}

export const verifyOTP = async (email:string, otp:string) => {
    const storesOTP = await redis.get(`otp:${email}`)
    if (!storesOTP) {
        throw new ErrorHandler('Invalid or expired OTP', 400)
    }

    const failedAttemptsKey = `otp_attempts:${email}`
    const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || '0')

    if (storesOTP !== otp) {
        if (failedAttempts >=2) {
            await redis.set(`otp_lock:${email}`, 'locked', 'EX', 30 * 60 )
            await redis.del(`otp:${email}`, failedAttemptsKey)
            throw new ErrorHandler('Too many failed attempts. Yours account is locked for 30 min', 400)
        }
        await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 5 * 60)
        throw new ErrorHandler(`Incorrect OTP. ${2 - failedAttempts} attempts left. `, 400)
    }

    await redis.del(`otp:${email}`, failedAttemptsKey)

}
