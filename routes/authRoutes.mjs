import express from 'express'
const router = express.Router()
import authController from  '../controllers/authController.mjs'
import { loginLimiter } from '../middleware/loginLimiter.mjs'

router.route('/')
    .post(loginLimiter, authController.login)

router.route('/refresh')
    .get(authController.refresh)

router.route('/logout')
    .post(authController.logout)

export default router

// when use const router = express.Router() please use export default 'module'