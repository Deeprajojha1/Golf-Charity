import User from '../models/User.js'
import Charity from '../models/Charity.js'
import Draw from '../models/Draw.js'
import Winner from '../models/Winner.js'
import { memoryStore } from '../services/memoryStore.js'
import { calculatePool } from '../utils/drawEngine.js'

function parseScorePayload(body) {
  const value = Number(body?.score)
  const playedAt = body?.date ? new Date(body.date) : new Date()

  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 1 || value > 45) {
    return { error: 'Score must be an integer between 1 and 45' }
  }

  if (Number.isNaN(playedAt.getTime())) {
    return { error: 'Invalid score date' }
  }

  return { value, playedAt }
}

async function listUsers(req, res) {
  if (memoryStore.enabled) {
    return res.json({ users: memoryStore.listUsersSafe() })
  }

  const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 }).lean()
  return res.json({ users })
}

async function updateUser(req, res) {
  const { userId } = req.params
  if (!userId) return res.status(400).json({ message: 'userId is required' })

  const payload = req.body || {}

  if (memoryStore.enabled) {
    const updated = memoryStore.updateUser(userId, payload)
    if (!updated) return res.status(404).json({ message: 'User not found' })
    return res.json({ user: updated })
  }

  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ message: 'User not found' })

  if (payload.name !== undefined) user.name = payload.name
  if (payload.email !== undefined) user.email = payload.email
  if (payload.charityId !== undefined) user.charityId = payload.charityId
  if (payload.charityContributionPercent !== undefined)
    user.charityContributionPercent = payload.charityContributionPercent
  if (payload.subscriptionPlan !== undefined) user.subscriptionPlan = payload.subscriptionPlan
  if (payload.subscriptionStatus !== undefined) user.subscriptionStatus = payload.subscriptionStatus
  if (payload.isAdmin !== undefined) user.isAdmin = payload.isAdmin

  await user.save()
  const safe = user.toObject()
  delete safe.passwordHash
  return res.json({ user: safe })
}

async function deleteUser(req, res) {
  const { userId } = req.params
  if (!userId) return res.status(400).json({ message: 'userId is required' })

  if (memoryStore.enabled) {
    const ok = memoryStore.deleteUser(userId)
    if (!ok) return res.status(404).json({ message: 'User not found' })
    return res.json({ ok: true })
  }

  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ message: 'User not found' })
  await Winner.deleteMany({ userId })
  await user.deleteOne()
  return res.json({ ok: true })
}

async function addUserScore(req, res) {
  const { userId } = req.params
  if (!userId) return res.status(400).json({ message: 'userId is required' })

  const parsed = parseScorePayload(req.body)
  if (parsed.error) return res.status(400).json({ message: parsed.error })

  if (memoryStore.enabled) {
    const updated = memoryStore.adminAddScore(userId, parsed)
    if (!updated) return res.status(404).json({ message: 'User not found' })
    return res.status(201).json({ user: updated })
  }

  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ message: 'User not found' })

  user.scores.push({ value: parsed.value, playedAt: parsed.playedAt })
  user.scores = user.scores
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
    .slice(0, 5)
  await user.save()

  const safe = user.toObject()
  delete safe.passwordHash
  return res.status(201).json({ user: safe })
}

async function updateUserScore(req, res) {
  const { userId, scoreId } = req.params
  if (!userId || !scoreId) {
    return res.status(400).json({ message: 'userId and scoreId are required' })
  }

  const parsed = parseScorePayload(req.body)
  if (parsed.error) return res.status(400).json({ message: parsed.error })

  if (memoryStore.enabled) {
    const updated = memoryStore.adminUpdateScore(userId, scoreId, parsed)
    if (!updated) return res.status(404).json({ message: 'Score not found' })
    return res.json({ user: updated })
  }

  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ message: 'User not found' })

  const score = user.scores.id(scoreId)
  if (!score) return res.status(404).json({ message: 'Score not found' })

  score.value = parsed.value
  score.playedAt = parsed.playedAt
  user.scores = user.scores
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
    .slice(0, 5)
  await user.save()

  const safe = user.toObject()
  delete safe.passwordHash
  return res.json({ user: safe })
}

async function summary(req, res) {
  if (memoryStore.enabled) {
    const users = memoryStore.listUsers()
    const charities = memoryStore.listCharities()
    const draws = memoryStore.listDraws()
    const winners = memoryStore.listWinners()
    const pool = calculatePool(
      users.filter((u) => u.subscriptionStatus === 'active'),
      memoryStore.getRollover() || 0,
    )
    const charityTotal = memoryStore.totalCharityContribution()
    return res.json({
      summary: {
        totalUsers: users.length,
        activeSubscribers: users.filter((u) => u.subscriptionStatus === 'active').length,
        charities: charities.length,
        draws: draws.length,
        winners: winners.length,
        prizePoolTotal: pool.total,
        charityContributionTotal: charityTotal,
      },
    })
  }

  const [users, charities, draws, winners] = await Promise.all([
    User.find({}).lean(),
    Charity.countDocuments(),
    Draw.countDocuments(),
    Winner.countDocuments(),
  ])
  const pool = calculatePool(
    users.filter((u) => u.subscriptionStatus === 'active'),
    0,
  )
  const charityContributionTotal = users.reduce((sum, user) => {
    if (user.subscriptionStatus !== 'active') return sum
    const plan = user.subscriptionPlan || 'monthly'
    const amount = plan === 'yearly' ? 250 : 25
    const pct = user.charityContributionPercent || 10
    return sum + (amount * pct) / 100
  }, 0)

  return res.json({
    summary: {
      totalUsers: users.length,
      activeSubscribers: users.filter((u) => u.subscriptionStatus === 'active').length,
      charities,
      draws,
      winners,
      prizePoolTotal: pool.total,
      charityContributionTotal,
    },
  })
}

export { listUsers, updateUser, deleteUser, addUserScore, updateUserScore, summary }
