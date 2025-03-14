import express from 'express'
import { handleApiRequest } from '../controller/apiController.js'

const router = express.Router()

// Định nghĩa route cho API
router.post('/', handleApiRequest)

export default router
