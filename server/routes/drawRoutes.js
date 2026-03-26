import express from 'express'
import { protect, requireAdmin } from '../middleware/authMiddleware.js'
import {
  listDraws,
  latestDraw,
  simulateDraw,
  publishDraw,
  resetDraw,
} from '../controllers/drawController.js'

const router = express.Router()

router.get('/', protect, listDraws)
router.get('/latest', protect, latestDraw)

router.post('/simulate', protect, requireAdmin, simulateDraw)
router.post('/publish', protect, requireAdmin, publishDraw)
router.delete('/:drawId', protect, requireAdmin, resetDraw)

export default router
