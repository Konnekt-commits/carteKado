import express from 'express'
import {createEntreprise, retrieveAllEntreprises, retrieveEntrepriseByID} from "@/controllers/entreprise.controller"
import {isValidEmail} from "@/middleware/email"

const router = express.Router()
router.post('/create-entreprise',isValidEmail, createEntreprise)
router.get('/entreprise/:id', retrieveEntrepriseByID)
router.get('/entreprises', retrieveAllEntreprises)
export default router
