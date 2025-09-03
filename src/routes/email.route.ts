import express from 'express'
import {isValidEmail} from "@/middleware/email"
import {isAuthenticated} from "@/middleware/auth"
import {authorizeRoles} from "@/controllers/user.controller"
import {Roles} from "@/customTypes"
import {AllEmails, createEmail, deleteEmail, updateEmail, emailInfo} from "@/controllers/email.controller"

const router = express.Router()

router.post('/create-email', isValidEmail,isAuthenticated,authorizeRoles(Roles.ADMIN), createEmail)
router.get('/email/:id', emailInfo)
router.put('/email-update/:id',isAuthenticated, authorizeRoles(Roles.ADMIN), updateEmail)
router.get('/emails', AllEmails)
router.delete('/delete-email/:id',isAuthenticated, authorizeRoles(Roles.ADMIN), deleteEmail)
export default router
