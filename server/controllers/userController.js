import mongoose from 'mongoose'
import User from '../models/User.js'
import Charity from '../models/Charity.js'
import { memoryStore } from '../services/memoryStore.js'

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

function formatDashboard(user, charityName = null) {
  const scores = [...(user.scores || [])]
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
    .map((s) => ({
      _id: s._id,
      value: s.value,
      playedAt: s.playedAt,
    }))

  return {
    profile: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: Boolean(user.isAdmin),
    },
    subscription: {
      plan: user.subscriptionPlan || 'monthly',
      status: user.subscriptionStatus || 'inactive',
      renewalDate: user.subscriptionRenewalDate || null,
    },
    charity: {
      charityId: user.charityId || null,
      charityName,
      contributionPercent: user.charityContributionPercent || 10,
    },
    scores,
    participation: {
      drawsEntered: user.drawsEntered || 0,
      upcomingDraw: 'Monthly draw',
    },
    winnings: {
      totalWon: user.totalWon || 0,
      payoutStatus: user.payoutStatus || 'none',
    },
  }
}

async function getDashboard(req, res) {
  if (memoryStore.enabled) {
    const dashboard = memoryStore.getDashboard(req.user._id)
    if (!dashboard) return res.status(404).json({ message: 'User not found' })
    return res.json({ dashboard })
  }

  const user = await User.findById(req.user._id).select('-passwordHash').lean()
  if (!user) return res.status(404).json({ message: 'User not found' })

  let charityName = null
  if (user.charityId && mongoose.Types.ObjectId.isValid(user.charityId)) {
    const charity = await Charity.findById(user.charityId).select('name').lean()
    charityName = charity?.name || null
  }

  return res.json({ dashboard: formatDashboard(user, charityName) })
}

async function addScore(req, res) {
  const parsed = parseScorePayload(req.body)
  if (parsed.error) return res.status(400).json({ message: parsed.error })

  if (memoryStore.enabled) {
    const updated = memoryStore.addScore(req.user._id, parsed)
    if (!updated) return res.status(404).json({ message: 'User not found' })

    const dashboard = memoryStore.getDashboard(req.user._id)
    return res.status(201).json({ dashboard })
  }

  const user = await User.findById(req.user._id)
  if (!user) return res.status(404).json({ message: 'User not found' })

  user.scores.push({ value: parsed.value, playedAt: parsed.playedAt })
  user.scores = user.scores
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
    .slice(0, 5)

  await user.save()

  const safeUser = user.toObject()
  delete safeUser.passwordHash

  let charityName = null
  if (safeUser.charityId) {
    const charity = await Charity.findById(safeUser.charityId).select('name').lean()
    charityName = charity?.name || null
  }

  return res.status(201).json({ dashboard: formatDashboard(safeUser, charityName) })
}

async function updateScore(req, res) {
  const parsed = parseScorePayload(req.body)
  if (parsed.error) return res.status(400).json({ message: parsed.error })

  const scoreId = req.params.scoreId
  if (!scoreId) return res.status(400).json({ message: 'scoreId is required' })

  if (memoryStore.enabled) {
    const updated = memoryStore.updateScore(req.user._id, scoreId, parsed)
    if (!updated) return res.status(404).json({ message: 'Score not found' })

    const dashboard = memoryStore.getDashboard(req.user._id)
    return res.json({ dashboard })
  }

  const user = await User.findById(req.user._id)
  if (!user) return res.status(404).json({ message: 'User not found' })

  const score = user.scores.id(scoreId)
  if (!score) return res.status(404).json({ message: 'Score not found' })

  score.value = parsed.value
  score.playedAt = parsed.playedAt

  user.scores = user.scores
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
    .slice(0, 5)

  await user.save()

  const safeUser = user.toObject()
  delete safeUser.passwordHash

  let charityName = null
  if (safeUser.charityId) {
    const charity = await Charity.findById(safeUser.charityId).select('name').lean()
    charityName = charity?.name || null
  }

  return res.json({ dashboard: formatDashboard(safeUser, charityName) })
}

async function updateProfile(req, res) {
  const { name, charityId, charityContributionPercent } = req.body || {}

  if (
    charityContributionPercent !== undefined &&
    (!Number.isFinite(Number(charityContributionPercent)) ||
      Number(charityContributionPercent) < 10 ||
      Number(charityContributionPercent) > 100)
  ) {
    return res
      .status(400)
      .json({ message: 'Charity contribution must be between 10 and 100 percent' })
  }

  if (memoryStore.enabled) {
    const updated = memoryStore.updateUser(req.user._id, {
      name,
      charityId,
      charityContributionPercent,
    })
    if (!updated) return res.status(404).json({ message: 'User not found' })
    return res.json({ user: updated })
  }

  if (name !== undefined) req.user.name = name
  if (charityId !== undefined) req.user.charityId = charityId
  if (charityContributionPercent !== undefined) {
    req.user.charityContributionPercent = charityContributionPercent
  }
  await req.user.save()
  const safe = req.user.toObject()
  delete safe.passwordHash
  return res.json({ user: safe })
}

async function deleteAccount(req, res) {
  if (memoryStore.enabled) {
    const ok = memoryStore.deleteUser(req.user._id)
    if (!ok) return res.status(404).json({ message: 'User not found' })
    return res.json({ ok: true })
  }

  await req.user.deleteOne()
  return res.json({ ok: true })
}

export { getDashboard, addScore, updateScore, updateProfile, deleteAccount }
