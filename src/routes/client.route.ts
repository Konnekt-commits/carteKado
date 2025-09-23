import express from 'express'
import {isValidEmail} from "@/middleware/email"
import {AllClients, ClientInfo, createClient, deleteClient, updateClient} from "@/controllers/client.controller"
import {isAuthenticated} from "@/middleware/auth"

const router = express.Router()

router.post('/create-client', isValidEmail,isAuthenticated, createClient)
router.get('/client/:id', ClientInfo)
router.put('/client-update/:id',isAuthenticated, updateClient)
router.get('/clients', AllClients)
router.delete('/delete-client/:id',isAuthenticated, deleteClient)
export default router
