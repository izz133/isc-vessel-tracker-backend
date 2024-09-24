import express from 'express'
const router = express.Router()
import notesController from '../controllers/notesController.mjs'
import { verifyJWT } from '../middleware/verifyJWT.mjs'

router.use(verifyJWT)

router.route('/')
    .get(notesController.getAllNotes)
    .post(notesController.createNewNote)
    .patch(notesController.updateNote)
    .delete(notesController.deleteNote)

export default router 