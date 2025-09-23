import express from 'express'
import {isValidEmail} from "@/middleware/email"
import {isAuthenticated} from "@/middleware/auth"

import {AllInvites, createInvite, deleteInvite, InviteInfo, updateInvite} from "@/controllers/invite.controller"

const router = express.Router()

router.post('/create-invite', isValidEmail,isAuthenticated, createInvite)
router.get('/invite/:id', InviteInfo)
router.put('/invite-update/:id',isAuthenticated, updateInvite)
router.get('/invites', AllInvites)
router.delete('/delete-invite/:id',isAuthenticated, deleteInvite)
export default router
