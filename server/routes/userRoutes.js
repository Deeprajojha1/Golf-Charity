// Purpose: Defines protected user endpoints for dashboard, profile, and score actions.
import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
  addScore,
  getDashboard,
  updateScore,
  updateProfile,
  deleteAccount,
} from '../controllers/userController.js'

const router = express.Router()

router.get('/dashboard', protect, getDashboard)
router.put('/profile', protect, updateProfile)
router.delete('/profile', protect, deleteAccount)
router.post('/scores', protect, addScore)
router.put('/scores/:scoreId', protect, updateScore)

export default router
