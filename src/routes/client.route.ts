import express from 'express'
import {isValidEmail} from "@/middleware/email"
import {AllClients, ClientInfo, createClient, deleteClient, updateClient} from "@/controllers/client.controller"
import {isAuthenticated} from "@/middleware/auth"
import {authorizeRoles} from "@/controllers/user.controller"
import {Roles} from "@/customTypes"

const router = express.Router()

router.post('/create-client', isValidEmail,isAuthenticated,authorizeRoles(Roles.ADMIN), createClient)
router.get('/client/:id', ClientInfo)
router.put('/client-update/:id',isAuthenticated, authorizeRoles(Roles.ADMIN), updateClient)
router.get('/clients', AllClients)
router.delete('/delete-client/:id',isAuthenticated, authorizeRoles(Roles.ADMIN), deleteClient)
export default router
