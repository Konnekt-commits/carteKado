import express from 'express'
import {isAuthenticated} from "@/middleware/auth"
import {authorizeRoles} from "@/controllers/user.controller"
import {Roles} from "@/customTypes"
import {AllCartes, CarteInfo, createCarteCadeau, deleteCarte} from "@/controllers/carte.controller"

const router = express.Router()

router.post('/create-carte', isAuthenticated, isAuthenticated,authorizeRoles(Roles.ADMIN), createCarteCadeau)
router.get('/carte/:id', CarteInfo)
router.get('/cartes-cadeaux', AllCartes)
router.delete('/delete-carte', isAuthenticated, authorizeRoles(Roles.ADMIN), deleteCarte)
export default router
