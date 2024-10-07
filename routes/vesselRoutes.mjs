import express from 'express'
const router = express.Router()
import vesselsController from '../controllers/vesselsController.mjs'
import { verifyJWT } from '../middleware/verifyJWT.mjs'

router.use(verifyJWT)

router.route('/')
    .get(vesselsController.getAllVessels)
    .post(vesselsController.createNewVessel)
    .patch(vesselsController.updateVessel)
    .delete(vesselsController.deleteVessel)

export default router 