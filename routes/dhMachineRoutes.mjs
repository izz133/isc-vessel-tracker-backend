import express from 'express'
const router = express.Router()
import dhMachinesController from '../controllers/dhMachinesController.mjs'
import { verifyJWT } from '../middleware/verifyJWT.mjs'

router.use(verifyJWT)

router.route('/')
    .get(dhMachinesController.getAllDhMachines)
    .post(dhMachinesController.createNewDhMachine)
    .patch(dhMachinesController.updateDhMachine)
    .delete(dhMachinesController.deleteDhMachine)

export default router 