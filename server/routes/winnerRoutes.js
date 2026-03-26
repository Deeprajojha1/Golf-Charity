import express from 'express'
import { protect, requireAdmin } from '../middleware/authMiddleware.js'
import {
  listUserWinnings,
  listAllWinners,
  submitProof,
  decideWinner,
  markPaid,
  removeWinner,
  getDrawWithWinners,
} from '../controllers/winnerController.js'

const router = express.Router()

router.get('/me', protect, listUserWinnings)
router.post('/:winnerId/proof', protect, submitProof)

router.get('/draw/:drawId', protect, requireAdmin, getDrawWithWinners)
router.get('/', protect, requireAdmin, listAllWinners)
router.put('/:winnerId/decision', protect, requireAdmin, decideWinner)
router.put('/:winnerId/pay', protect, requireAdmin, markPaid)
router.delete('/:winnerId', protect, requireAdmin, removeWinner)

export default router
