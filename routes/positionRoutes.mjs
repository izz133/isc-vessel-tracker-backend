import express from 'express'
const router = express.Router()
import positionsController from '../controllers/positionsController.mjs'
import { verifyJWT } from '../middleware/verifyJWT.mjs'

router.use(verifyJWT)

router.route('/')
    .get(positionsController.getAllPositions)
    .post(positionsController.createNewPosition)
    .patch(positionsController.updatePosition)
    .delete(positionsController.deletePosition)

export default router 