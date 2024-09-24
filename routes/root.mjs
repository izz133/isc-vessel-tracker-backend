import express from 'express'
const router = express.Router()
import path from 'path'
import __dirname from '../middleware/dirname.mjs';

//router
router.get('^/$|/index(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
});

export { router }