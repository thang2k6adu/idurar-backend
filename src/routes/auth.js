import express from 'express'
import { authController } from '~/controllers/authController'

const router = express.Router()

// Auth routes - No authentication required
router.post('/login', authController.login)
router.post('/register', authController.register)
// router.post('/forgot-password', authController.forgotPassword)
// router.post('/reset-password', authController.resetPassword)

export const authRoutes = router