import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { SUBSCRIPTION_PRICING } from '../utils/constants.js'

const enabled = !process.env.MONGO_URI

const state = {
  users: [],
  charities: [],
  draws: [],
  winners: [],
  rollover: 0,
}

const SAMPLE_CHARITIES = [
  {
    _id: '65f000000000000000000001',
    name: 'Youth Golf Access Fund',
    description: 'Helping kids access coaching, gear, and green fees.',
    tags: ['youth', 'sports'],
  },
  {
    _id: '65f000000000000000000002',
    name: 'Cancer Care Support Network',
    description: 'Supporting patients and families with critical care costs.',
    tags: ['health'],
  },
  {
    _id: '65f000000000000000000003',
    name: 'Clean Water Initiative',
    description: 'Building sustainable access to safe drinking water.',
    tags: ['water', 'global'],
  },
]

function createId() {
  return crypto.randomBytes(12).toString('hex')
}

function nextRenewalDate(plan) {
  const d = new Date()
  d.setMonth(d.getMonth() + (plan === 'yearly' ? 12 : 1))
  return d
}

async function createUser({
  name,
  email,
  password,
  charityId,
  subscriptionPlan = 'monthly',
  charityContributionPercent = 10,
  requestedRole = 'subscriber',
}) {
  const existing = state.users.find((u) => u.email === email)
  if (existing) {
    const err = new Error('User already exists')
    err.statusCode = 400
    throw err
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = {
    _id: createId(),
    name,
    email,
    passwordHash,
    charityId,
    charityContributionPercent,
    subscriptionPlan,
    subscriptionStatus: 'active',
    subscriptionRenewalDate: nextRenewalDate(subscriptionPlan),
    requestedRole,
    scores: [],
    drawsEntered: 0,
    totalWon: 0,
    payoutStatus: 'none',
    isAdmin: state.users.length === 0,
  }
  state.users.push(user)
  return user
}

async function authenticate(email, password) {
  const user = state.users.find((u) => u.email === email)
  if (!user) return null
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return null
  return user
}

function findUserById(id) {
  const user = state.users.find((u) => u._id === id)
  if (!user) return null
  const { passwordHash, ...safe } = user
  return safe
}

function safeUser(user) {
  const { passwordHash, ...safe } = user
  return safe
}

function getUserById(id) {
  return state.users.find((u) => u._id === id) || null
}

function listUsers() {
  return state.users
}

function listUsersSafe() {
  return state.users.map((u) => safeUser(u))
}

function updateUser(userId, payload) {
  const user = getUserById(userId)
  if (!user) return null

  if (payload.name !== undefined) user.name = payload.name
  if (payload.email !== undefined) user.email = payload.email
  if (payload.charityId !== undefined) user.charityId = payload.charityId
  if (payload.charityContributionPercent !== undefined)
    user.charityContributionPercent = payload.charityContributionPercent
  if (payload.subscriptionPlan !== undefined) user.subscriptionPlan = payload.subscriptionPlan
  if (payload.subscriptionStatus !== undefined) user.subscriptionStatus = payload.subscriptionStatus
  if (payload.subscriptionRenewalDate !== undefined)
    user.subscriptionRenewalDate = payload.subscriptionRenewalDate
  if (payload.isAdmin !== undefined) user.isAdmin = payload.isAdmin

  return safeUser(user)
}

function deleteUser(userId) {
  const index = state.users.findIndex((u) => u._id === userId)
  if (index === -1) return false
  state.users.splice(index, 1)
  state.winners = state.winners.filter((w) => w.userId !== userId)
  return true
}

function updateSubscription(userId, { plan, status, renewalDate }) {
  const user = getUserById(userId)
  if (!user) return null
  if (plan !== undefined) user.subscriptionPlan = plan
  if (status !== undefined) user.subscriptionStatus = status
  if (renewalDate !== undefined) user.subscriptionRenewalDate = renewalDate
  return {
    plan: user.subscriptionPlan,
    status: user.subscriptionStatus,
    renewalDate: user.subscriptionRenewalDate,
  }
}

function addScore(userId, { value, playedAt }) {
  const user = getUserById(userId)
  if (!user) return null

  user.scores.push({ _id: createId(), value, playedAt: new Date(playedAt) })
  user.scores = user.scores
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
    .slice(0, 5)

  return safeUser(user)
}

function updateScore(userId, scoreId, { value, playedAt }) {
  const user = getUserById(userId)
  if (!user) return null

  const score = user.scores.find((s) => s._id === scoreId)
  if (!score) return false

  score.value = value
  score.playedAt = new Date(playedAt)
  user.scores = user.scores
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
    .slice(0, 5)

  return safeUser(user)
}

function adminAddScore(userId, { value, playedAt }) {
  const user = getUserById(userId)
  if (!user) return null
  user.scores.push({ _id: createId(), value, playedAt: new Date(playedAt) })
  user.scores = user.scores
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
    .slice(0, 5)
  return safeUser(user)
}

function adminUpdateScore(userId, scoreId, { value, playedAt }) {
  const user = getUserById(userId)
  if (!user) return null
  const score = user.scores.find((s) => s._id === scoreId)
  if (!score) return false
  score.value = value
  score.playedAt = new Date(playedAt)
  user.scores = user.scores
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
    .slice(0, 5)
  return safeUser(user)
}

function getDashboard(userId) {
  const user = getUserById(userId)
  if (!user) return null

  const charity = SAMPLE_CHARITIES.find((c) => c._id === user.charityId) || null
  return {
    profile: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    subscription: {
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      renewalDate: user.subscriptionRenewalDate,
    },
    charity: {
      charityId: user.charityId || null,
      charityName: charity?.name || null,
      contributionPercent: user.charityContributionPercent,
    },
    scores: [...user.scores].sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt)),
    participation: {
      drawsEntered: user.drawsEntered,
      upcomingDraw: 'Monthly draw',
    },
    winnings: {
      totalWon: user.totalWon,
      payoutStatus: user.payoutStatus,
    },
  }
}

function ensureCharities() {
  if (state.charities.length === 0) {
    state.charities = SAMPLE_CHARITIES.map((c) => ({ ...c }))
  }
}

function listCharities() {
  ensureCharities()
  return state.charities
}

function createCharity(payload) {
  ensureCharities()
  const charity = {
    _id: createId(),
    name: payload.name,
    description: payload.description || '',
    tags: payload.tags || [],
    featured: Boolean(payload.featured),
    images: payload.images || [],
    events: payload.events || [],
  }
  state.charities.push(charity)
  return charity
}

function updateCharity(charityId, payload) {
  ensureCharities()
  const charity = state.charities.find((c) => c._id === charityId)
  if (!charity) return null
  if (payload.name !== undefined) charity.name = payload.name
  if (payload.description !== undefined) charity.description = payload.description
  if (payload.tags !== undefined) charity.tags = payload.tags
  if (payload.images !== undefined) charity.images = payload.images
  if (payload.featured !== undefined) charity.featured = payload.featured
  if (payload.events !== undefined) charity.events = payload.events
  return charity
}

function deleteCharity(charityId) {
  ensureCharities()
  const index = state.charities.findIndex((c) => c._id === charityId)
  if (index === -1) return false
  state.charities.splice(index, 1)
  return true
}

function createDraw(payload) {
  const draw = {
    _id: createId(),
    monthKey: payload.monthKey,
    numbers: payload.numbers,
    logicType: payload.logicType,
    status: 'published',
    prizePoolTotal: payload.prizePoolTotal,
    prizePoolBreakdown: payload.prizePoolBreakdown,
    publishedAt: payload.publishedAt,
    createdAt: new Date(),
  }
  state.draws.unshift(draw)
  state.rollover = payload.prizePoolBreakdown?.rollover || 0
  return draw
}

function listDraws() {
  return state.draws
}

function latestDraw() {
  return state.draws[0] || null
}

function getDraw(drawId) {
  return state.draws.find((d) => d._id === drawId) || null
}

function deleteDraw(drawId) {
  const index = state.draws.findIndex((d) => d._id === drawId)
  if (index === -1) return false
  state.draws.splice(index, 1)
  state.winners = state.winners.filter((w) => w.drawId !== drawId)
  return true
}

function getRollover() {
  return state.rollover
}

function createWinners(draw, winners, prizeMap) {
  const created = winners.map((w) => {
    const prizeAmount =
      w.matchCount === 5
        ? prizeMap.match5
        : w.matchCount === 4
          ? prizeMap.match4
          : prizeMap.match3
    const winner = {
      _id: createId(),
      drawId: draw._id,
      userId: w.user._id,
      matchCount: w.matchCount,
      prizeAmount,
      payoutStatus: 'pending',
      proof: {
        url: '',
        note: '',
        submittedAt: null,
        reviewedAt: null,
        decisionNote: '',
      },
      createdAt: new Date(),
    }
    state.winners.push(winner)
    return winner
  })
  return created
}

function listWinners() {
  return state.winners
}

function listWinnersForUser(userId) {
  return state.winners.filter((w) => w.userId === userId)
}

function listWinnersForDraw(drawId) {
  return state.winners.filter((w) => w.drawId === drawId)
}

function submitProof(userId, winnerId, { proofUrl, note }) {
  const winner = state.winners.find((w) => w._id === winnerId && w.userId === userId)
  if (!winner) return null
  winner.proof.url = proofUrl || ''
  winner.proof.note = note || ''
  winner.proof.submittedAt = new Date()
  return winner
}

function decideWinner(winnerId, decision, note) {
  const winner = state.winners.find((w) => w._id === winnerId)
  if (!winner) return null
  winner.payoutStatus = decision === 'approve' ? 'pending' : 'rejected'
  winner.proof.reviewedAt = new Date()
  winner.proof.decisionNote = note || ''
  return winner
}

function markWinnerPaid(winnerId) {
  const winner = state.winners.find((w) => w._id === winnerId)
  if (!winner) return null
  winner.payoutStatus = 'paid'
  return winner
}

function deleteWinner(winnerId) {
  const index = state.winners.findIndex((w) => w._id === winnerId)
  if (index === -1) return false
  state.winners.splice(index, 1)
  return true
}

function totalCharityContribution() {
  return state.users.reduce((sum, user) => {
    if (user.subscriptionStatus !== 'active') return sum
    const plan = user.subscriptionPlan || 'monthly'
    const price = SUBSCRIPTION_PRICING[plan] || SUBSCRIPTION_PRICING.monthly
    const pct = user.charityContributionPercent || 10
    return sum + (price * pct) / 100
  }, 0)
}

function incrementDrawsEntered() {
  state.users.forEach((user) => {
    if (user.subscriptionStatus === 'active') {
      user.drawsEntered = (user.drawsEntered || 0) + 1
    }
  })
}

function applyWinnerTotals(winnerEntries) {
  winnerEntries.forEach((winner) => {
    const user = getUserById(winner.userId)
    if (user) {
      user.totalWon = (user.totalWon || 0) + (winner.prizeAmount || 0)
    }
  })
}

const memoryStore = {
  enabled,
  createUser,
  authenticate,
  findUserById,
  safeUser,
  listUsers,
  listUsersSafe,
  updateUser,
  deleteUser,
  updateSubscription,
  addScore,
  updateScore,
  adminAddScore,
  adminUpdateScore,
  getDashboard,
  listCharities,
  createCharity,
  updateCharity,
  deleteCharity,
  createDraw,
  listDraws,
  latestDraw,
  getDraw,
  deleteDraw,
  createWinners,
  listWinners,
  listWinnersForUser,
  listWinnersForDraw,
  submitProof,
  decideWinner,
  markWinnerPaid,
  deleteWinner,
  getRollover,
  totalCharityContribution,
  incrementDrawsEntered,
  applyWinnerTotals,
}

export { memoryStore }
