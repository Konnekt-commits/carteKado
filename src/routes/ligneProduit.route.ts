import express from 'express'
import {isValidEmail} from "@/middleware/email"
import {isAuthenticated} from "@/middleware/auth"
import {authorizeRoles} from "@/controllers/user.controller"
import {Roles} from "@/customTypes"
import {
    AllLigneProduits, createLigneProduit,
    deleteLigneProduit,
    ligneProduittInfo,
    updateLigneProduit
} from "@/controllers/ligneProduit.controller"

const router = express.Router()

router.post('/create-ligne-produit', isValidEmail,isAuthenticated,authorizeRoles(Roles.ADMIN), createLigneProduit)
router.get('/ligne-produit', ligneProduittInfo)
router.put('/ligne-produit-update',isAuthenticated, authorizeRoles(Roles.ADMIN), updateLigneProduit)
router.get('/ligne-produits', AllLigneProduits)
router.delete('/delete-ligne-produit',isAuthenticated, authorizeRoles(Roles.ADMIN), deleteLigneProduit)
export default router
