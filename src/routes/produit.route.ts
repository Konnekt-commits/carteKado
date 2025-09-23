import express from 'express'
import {isAuthenticated} from "@/middleware/auth"
import {authorizeRoles} from "@/controllers/user.controller"
import {Roles} from "@/customTypes"
import {
    AllProduits,
    createProduit,
    deleteProduit,
    produitInfo,
    searchProduits,
    updateProduit
} from "@/controllers/produit.controller"

const router = express.Router()

router.post('/create-produit',isAuthenticated, createProduit)
router.get('/produit/:id', produitInfo)
router.put('/produit-update/:id',isAuthenticated, updateProduit)
router.get('/produits', AllProduits)
router.get('/search-produit',isAuthenticated, searchProduits)
router.delete('/delete-produit/:id',isAuthenticated, deleteProduit)
export default router
