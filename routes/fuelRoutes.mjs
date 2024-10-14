import express from 'express';
const router = express.Router();
import fuelsController from '../controllers/fuelsController.mjs';
import { verifyJWT } from '../middleware/verifyJWT.mjs';

router.use(verifyJWT);

router.route('/')
    .get(fuelsController.getAllFuels)
    .post(fuelsController.createNewFuel)
    .patch(fuelsController.updateFuel)
    .delete(fuelsController.deleteFuel);

export default router;
