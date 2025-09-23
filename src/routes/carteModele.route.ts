import express from 'express'
import {isValidEmail} from "@/middleware/email"
import {isAuthenticated} from "@/middleware/auth"
import {authorizeRoles} from "@/controllers/user.controller"
import {Roles} from "@/customTypes"
import {
    AllCarteModeles,
    CarteModeleInfo,
    createCarteModele, deleteCarteModele,
    updateCarteModele
} from "@/controllers/carteModele.controller"

const router = express.Router()

router.post('/create-carte-modele', isValidEmail,isAuthenticated, createCarteModele)
router.get('/carte-modele/:id', CarteModeleInfo)
router.put('/carte-modele-update/:id',isAuthenticated, updateCarteModele)
router.get('/carte-modeles', AllCarteModeles)
router.delete('/delete-carte-modele/:id',isAuthenticated, deleteCarteModele)
export default router
