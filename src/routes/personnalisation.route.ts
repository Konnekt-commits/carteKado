import express from 'express'

import {
    AllCartePersonnalisation,
    cartePersonnalisationInfo,
    createCartePersonnalisation, deleteCartePersonnalisation,
    updateCartePersonnalisation
} from "@/controllers/cartePersonnalisation.controller"

const router = express.Router()

router.post('/add-personnalisation', createCartePersonnalisation)
router.get('/personnalisation/:id', cartePersonnalisationInfo)
router.put('/update-personnalisation/:id',  updateCartePersonnalisation)
router.get('/personnalisations', AllCartePersonnalisation)
router.delete('/delete-personnalisation/:id', deleteCartePersonnalisation)
export default router
