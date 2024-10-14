import express from 'express';
const router = express.Router();
import rhReadingsController from '../controllers/rhReadingsController.mjs';
import { verifyJWT } from '../middleware/verifyJWT.mjs';

router.use(verifyJWT);

router.route('/')
    .get(rhReadingsController.getAllRhReadings)
    .post(rhReadingsController.createNewRhReading)
    .patch(rhReadingsController.updateRhReading)
    .delete(rhReadingsController.deleteRhReading);

export default router;
