import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
  getStatus,
  startSubscription,
  cancelSubscription,
  renewSubscription,
} from '../controllers/subscriptionController.js'

const router = express.Router()

router.get('/status', protect, getStatus)
router.post('/start', protect, startSubscription)
router.put('/cancel', protect, cancelSubscription)
router.put('/renew', protect, renewSubscription)

export default router
