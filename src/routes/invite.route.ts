import express from 'express'
import {isValidEmail} from "@/middleware/email"
import {isAuthenticated} from "@/middleware/auth"
import {authorizeRoles} from "@/controllers/user.controller"
import {Roles} from "@/customTypes"
import {AllInvites, createInvite, deleteInvite, InviteInfo, updateInvite} from "@/controllers/invite.controller"

const router = express.Router()

router.post('/create-invite', isValidEmail,isAuthenticated,authorizeRoles(Roles.ADMIN), createInvite)
router.get('/invite/:id', InviteInfo)
router.put('/invite-update/:id',isAuthenticated, authorizeRoles(Roles.ADMIN), updateInvite)
router.get('/invites', AllInvites)
router.delete('/delete-invite/:id',isAuthenticated, authorizeRoles(Roles.ADMIN), deleteInvite)
export default router
