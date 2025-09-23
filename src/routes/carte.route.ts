import express from 'express'
import {isAuthenticated} from "@/middleware/auth"

import {AllCartes, CarteInfo, createCarteCadeau, deleteCarte, updateCarteCadeau} from "@/controllers/carte.controller"

const router = express.Router()

router.post('/create-carte', isAuthenticated, createCarteCadeau)
router.get('/carte/:id', CarteInfo)
router.put('/carte-update/:id', isAuthenticated, updateCarteCadeau)
router.get('/cartes-cadeaux', AllCartes)
router.delete('/delete-carte/:id', isAuthenticated, deleteCarte)
export default router
