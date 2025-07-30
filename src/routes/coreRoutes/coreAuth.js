import express from 'express'
import adminAuth from '~/controllers/coreControllers/adminAuth'
import { errorHandlers } from '~/handlers/errorHandlers'

const router = express.Router()

router.route('/login').post(errorHandlers.catchErrors(adminAuth.login))
router.route('/forgetpassword').post(errorHandlers.catchErrors(adminAuth.forgetPassword))
router.route('/resetpassword').post(errorHandlers.catchErrors(adminAuth.resetPassword))
router
  .route('/logout')
  .post(adminAuth.isValidAuthToken, errorHandlers.catchErrors(adminAuth.logout))
router.route('/register').post(errorHandlers.catchErrors(adminAuth.register))

export default router
