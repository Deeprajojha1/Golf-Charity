import express from 'express'
import { protect, requireAdmin } from '../middleware/authMiddleware.js'
import {
  listUsers,
  updateUser,
  deleteUser,
  addUserScore,
  updateUserScore,
  summary,
} from '../controllers/adminController.js'
import { createCharity, updateCharity, deleteCharity } from '../controllers/charityController.js'

const router = express.Router()

router.get('/summary', protect, requireAdmin, summary)
router.get('/users', protect, requireAdmin, listUsers)
router.put('/users/:userId', protect, requireAdmin, updateUser)
router.delete('/users/:userId', protect, requireAdmin, deleteUser)
router.post('/users/:userId/scores', protect, requireAdmin, addUserScore)
router.put('/users/:userId/scores/:scoreId', protect, requireAdmin, updateUserScore)

router.post('/charities', protect, requireAdmin, createCharity)
router.put('/charities/:charityId', protect, requireAdmin, updateCharity)
router.delete('/charities/:charityId', protect, requireAdmin, deleteCharity)

export default router
