import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { memoryStore } from '../services/memoryStore.js'

async function protect(req, res, next) {
  try {
    const token = req.cookies?.jwt
    if (!token) return res.status(401).json({ message: 'Not authenticated' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded?.userId

    if (memoryStore.enabled) {
      const user = memoryStore.findUserById(userId)
      if (!user) return res.status(401).json({ message: 'Not authenticated' })
      req.user = user
      return next()
    }

    const user = await User.findById(userId).select('-passwordHash')
    if (!user) return res.status(401).json({ message: 'Not authenticated' })

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' })
  }
  return next()
}

export { protect, requireAdmin }
