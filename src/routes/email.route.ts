import express from 'express'
import {isValidEmail} from "@/middleware/email"
import {isAuthenticated} from "@/middleware/auth"

import {AllEmails, createEmail, deleteEmail, updateEmail, emailInfo} from "@/controllers/email.controller"

const router = express.Router()

router.post('/create-email', isValidEmail,isAuthenticated, createEmail)
router.get('/email/:id', emailInfo)
router.put('/email-update/:id',isAuthenticated, updateEmail)
router.get('/emails', AllEmails)
router.delete('/delete-email/:id',isAuthenticated, deleteEmail)
export default router
