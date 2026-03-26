import express from 'express'
import { listCharities } from '../controllers/charityController.js'

const router = express.Router()

router.get('/', listCharities)

export default router
