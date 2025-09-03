import express from 'express'
import {isAuthenticated} from "@/middleware/auth"
import {authorizeRoles} from "@/controllers/user.controller"
import {Roles} from "@/customTypes"
import {createCarteCadeau} from "@/controllers/carte.controller"
const router = express.Router()

router.post('/create-carte', isAuthenticated, isAuthenticated,authorizeRoles(Roles.ADMIN), createCarteCadeau)
export default router
