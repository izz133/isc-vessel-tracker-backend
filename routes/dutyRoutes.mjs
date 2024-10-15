import express from 'express';
const router = express.Router();
import dutiesController from '../controllers/dutiesController.mjs'; // Assuming the controller is located here
import { verifyJWT } from '../middleware/verifyJWT.mjs'; // Middleware to verify JWT

// Apply JWT verification middleware to all routes
router.use(verifyJWT);

router.route('/')
    .get(dutiesController.getAllDuties)     // GET: Retrieve all duties
    .post(dutiesController.createNewDuty)   // POST: Create a new duty
    .patch(dutiesController.updateDuty)     // PATCH: Update an existing duty
    .delete(dutiesController.deleteDuty);   // DELETE: Delete a duty

export default router;
