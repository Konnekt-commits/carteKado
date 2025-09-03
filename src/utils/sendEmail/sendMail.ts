import nodemailer from 'nodemailer'
import process from "node:process"
import ejs from 'ejs'
import dotenv from 'dotenv'
import path from 'path'
import ErrorHandler from "@/utils/ErrorHandler"

dotenv.config()

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD
    }
})

// Render an EJS email template
const renderEmailTemplate = async (templateName:string, data: Record<string, any>) : Promise<string> => {
    const templatePath = path.join(
        process.cwd(),
        'src',
        'emailTemplate',
        `${templateName}.ejs`
    )

    return ejs.renderFile(templatePath, data)
}

export const sendEmail = async (to: string, subject:string, templateName:string, data: Record<string, any>) => {
    try {
        const html = await renderEmailTemplate(templateName, data)

        await transporter.sendMail({
            from:`<${process.env.SMTP_MAIL}`,
            to,
            subject,
            html
        })
        return true
    }catch (error) {
        throw new ErrorHandler(error as string, 401)
        // console.log('Error sending email ', error)
        // return false
    }
}
