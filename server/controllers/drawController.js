import Draw from '../models/Draw.js'
import Winner from '../models/Winner.js'
import User from '../models/User.js'
import { memoryStore } from '../services/memoryStore.js'
import {
  getMonthKey,
  generateRandomNumbers,
  generateWeightedNumbers,
  evaluateWinners,
  calculatePool,
  splitPrize,
} from '../utils/drawEngine.js'

async function listDraws(req, res) {
  if (memoryStore.enabled) {
    return res.json({ draws: memoryStore.listDraws() })
  }

  const draws = await Draw.find({}).sort({ createdAt: -1 }).lean()
  return res.json({ draws })
}

async function latestDraw(req, res) {
  if (memoryStore.enabled) {
    const latest = memoryStore.latestDraw()
    return res.json({ draw: latest })
  }

  const draw = await Draw.findOne({}).sort({ createdAt: -1 }).lean()
  return res.json({ draw })
}

async function simulateDraw(req, res) {
  const logicType = req.body?.logicType === 'weighted' ? 'weighted' : 'random'

  const users = memoryStore.enabled
    ? memoryStore.listUsers()
    : await User.find({}).lean()

  const activeUsers = users.filter((u) => u.subscriptionStatus === 'active')

  // Generate 5 winning numbers using the selected logic.
  const drawNumbers =
    logicType === 'weighted'
      ? generateWeightedNumbers(activeUsers)
      : generateRandomNumbers()

  const winners = evaluateWinners(activeUsers, drawNumbers)
  // Prize pool is based on active subscriptions only.
  const pool = calculatePool(activeUsers, 0)

  const match5 = winners.filter((w) => w.matchCount === 5)
  const match4 = winners.filter((w) => w.matchCount === 4)
  const match3 = winners.filter((w) => w.matchCount === 3)

  return res.json({
    simulation: {
      monthKey: getMonthKey(),
      logicType,
      numbers: drawNumbers,
      pool,
      winners: {
        match5: match5.length,
        match4: match4.length,
        match3: match3.length,
      },
    },
  })
}

async function publishDraw(req, res) {
  const logicType = req.body?.logicType === 'weighted' ? 'weighted' : 'random'
  const monthKey = getMonthKey()

  const users = memoryStore.enabled
    ? memoryStore.listUsers()
    : await User.find({}).lean()

  const activeUsers = users.filter((u) => u.subscriptionStatus === 'active')

  // Generate 5 winning numbers using the selected logic.
  const drawNumbers =
    logicType === 'weighted'
      ? generateWeightedNumbers(activeUsers)
      : generateRandomNumbers()

  const previousRollover = memoryStore.enabled
    ? memoryStore.getRollover()
    : await Draw.findOne({}).sort({ createdAt: -1 }).lean()

  const rolloverAmount = memoryStore.enabled
    ? previousRollover
    : previousRollover?.prizePoolBreakdown?.rollover || 0

  // Apply any rollover from the last month.
  const pool = calculatePool(activeUsers, rolloverAmount || 0)
  const winners = evaluateWinners(activeUsers, drawNumbers)

  const match5 = winners.filter((w) => w.matchCount === 5)
  const match4 = winners.filter((w) => w.matchCount === 4)
  const match3 = winners.filter((w) => w.matchCount === 3)

  const match5Prize = match5.length ? splitPrize(pool.match5, match5.length) : 0
  const match4Prize = match4.length ? splitPrize(pool.match4, match4.length) : 0
  const match3Prize = match3.length ? splitPrize(pool.match3, match3.length) : 0
  const rollover = match5.length ? 0 : pool.match5

  if (memoryStore.enabled) {
    const draw = memoryStore.createDraw({
      monthKey,
      numbers: drawNumbers,
      logicType,
      prizePoolTotal: pool.total,
      prizePoolBreakdown: {
        match5: pool.match5,
        match4: pool.match4,
        match3: pool.match3,
        rollover,
      },
      publishedAt: new Date(),
    })
    const winnerEntries = memoryStore.createWinners(draw, winners, {
      match5: match5Prize,
      match4: match4Prize,
      match3: match3Prize,
    })
    memoryStore.incrementDrawsEntered()
    memoryStore.applyWinnerTotals(winnerEntries)
    return res.status(201).json({ draw, winners: winnerEntries })
  }

  const draw = await Draw.create({
    monthKey,
    numbers: drawNumbers,
    logicType,
    prizePoolTotal: pool.total,
    prizePoolBreakdown: {
      match5: pool.match5,
      match4: pool.match4,
      match3: pool.match3,
      rollover,
    },
    publishedAt: new Date(),
  })

  const winnerDocs = winners.map((w) => {
    const prizeAmount =
      w.matchCount === 5
        ? match5Prize
        : w.matchCount === 4
          ? match4Prize
          : match3Prize
    return {
      drawId: draw._id,
      userId: w.user._id,
      matchCount: w.matchCount,
      prizeAmount,
      payoutStatus: 'pending',
    }
  })

  const storedWinners = winnerDocs.length ? await Winner.insertMany(winnerDocs) : []

  await User.updateMany(
    { subscriptionStatus: 'active' },
    { $inc: { drawsEntered: 1 } },
  )

  for (const winner of storedWinners) {
    await User.findByIdAndUpdate(winner.userId, { $inc: { totalWon: winner.prizeAmount } })
  }
  return res.status(201).json({ draw, winners: storedWinners })
}

async function resetDraw(req, res) {
  const { drawId } = req.params
  if (!drawId) return res.status(400).json({ message: 'drawId is required' })

  if (memoryStore.enabled) {
    const ok = memoryStore.deleteDraw(drawId)
    if (!ok) return res.status(404).json({ message: 'Draw not found' })
    return res.json({ ok: true })
  }

  await Winner.deleteMany({ drawId })
  const draw = await Draw.findById(drawId)
  if (!draw) return res.status(404).json({ message: 'Draw not found' })
  await draw.deleteOne()
  return res.json({ ok: true })
}

export {
  listDraws,
  latestDraw,
  simulateDraw,
  publishDraw,
  resetDraw,
}
