import express from 'express'
import {isAuthenticated} from "@/middleware/auth"
import {authorizeRoles} from "@/controllers/user.controller"
import {Roles} from "@/customTypes"
import {
    AllReglagesByEntreprise,
    createReglage,
    deleteReglage, reglageAddProduct,
    reglageInfo,
    updateReglage
} from "@/controllers/reglage.controller"

const router = express.Router()

router.post('/create-reglage',isAuthenticated,authorizeRoles(Roles.ADMIN), createReglage)
router.get('/reglage/:id', reglageInfo)
router.put('/reglage-update/:id',isAuthenticated, authorizeRoles(Roles.ADMIN), updateReglage)
router.post('/reglage-add-produit/:id',isAuthenticated, reglageAddProduct)
router.get('/reglages', AllReglagesByEntreprise)
router.delete('/delete-reglage/:id',isAuthenticated, authorizeRoles(Roles.ADMIN), deleteReglage)
export default router
