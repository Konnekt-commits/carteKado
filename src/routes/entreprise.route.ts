import express from 'express'
import {createEntreprise, retrieveEntrepriseByID} from "@/controllers/entreprise.controller"
import {isValidEmail} from "@/middleware/email"

const router = express.Router()
router.post('/create-entreprise',isValidEmail, createEntreprise)
router.get('/entreprise/:id', retrieveEntrepriseByID)
export default router
