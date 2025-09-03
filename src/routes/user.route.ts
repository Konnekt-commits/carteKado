import express from 'express'
import {getUser, loginUser, logoutUser, refreshToken, updatePassword, userRegistration, verifyUser} from "@/controllers/user.controller"
import {isAuthenticated} from "@/middleware/auth"

const router = express.Router()

router.post('/user-registration', userRegistration)
router.post('/verify-user', verifyUser)
router.post('/login', loginUser)
router.get('/refresh-token', refreshToken)
router.get('/me', isAuthenticated, getUser)
router.put('/update-user-password', isAuthenticated, updatePassword)
router.get('/logout', isAuthenticated, logoutUser)
// router.get('/get-users', isAuthenticated,authorizeRoles('admin'), getAllUsers)
// router.put('/update-user-role', isAuthenticated,authorizeRoles('admin'), updateUserRole)
// router.delete('/delete-user/:id', isAuthenticated,authorizeRoles('admin'), deleteUser)
export default router
