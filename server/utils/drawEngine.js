// Draw engine helpers used by admin draw actions and simulations.
import { PRIZE_POOL_PERCENT, PRIZE_SPLIT, SUBSCRIPTION_PRICING } from './constants.js'

function getMonthKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function uniqueNumbers(numbers) {
  return Array.from(new Set(numbers))
}

function generateRandomNumbers() {
  const picks = new Set()
  while (picks.size < 5) {
    const value = Math.floor(Math.random() * 45) + 1
    picks.add(value)
  }
  return Array.from(picks)
}

function generateWeightedNumbers(users) {
  const frequency = new Map()
  users.forEach((u) => {
    ;(u.scores || []).forEach((s) => {
      const key = Number(s.value)
      if (!Number.isFinite(key)) return
      frequency.set(key, (frequency.get(key) || 0) + 1)
    })
  })

  if (frequency.size === 0) return generateRandomNumbers()

  const candidates = Array.from({ length: 45 }, (_, idx) => idx + 1)
  const picks = []

  while (picks.length < 5 && candidates.length) {
    const totalWeight = candidates.reduce(
      (sum, value) => sum + (frequency.get(value) || 1),
      0,
    )
    let roll = Math.random() * totalWeight
    let selectedIndex = 0
    for (let i = 0; i < candidates.length; i += 1) {
      roll -= frequency.get(candidates[i]) || 1
      if (roll <= 0) {
        selectedIndex = i
        break
      }
    }
    const [chosen] = candidates.splice(selectedIndex, 1)
    picks.push(chosen)
  }

  return picks.length === 5 ? picks : uniqueNumbers([...picks, ...generateRandomNumbers()]).slice(0, 5)
}

function normalizeScores(user) {
  return uniqueNumbers(
    (user.scores || [])
      .map((s) => Number(s.value))
      .filter((v) => Number.isFinite(v)),
  )
}

function evaluateWinners(users, drawNumbers) {
  const winners = []
  users.forEach((u) => {
    const userScores = normalizeScores(u)
    const matches = userScores.filter((value) => drawNumbers.includes(value))
    const matchCount = matches.length
    if (matchCount >= 3) {
      winners.push({
        user: u,
        matchCount,
        matches,
      })
    }
  })
  return winners
}

function calculatePool(users, rollover = 0) {
  const activeUsers = users.filter((u) => u.subscriptionStatus === 'active')
  const revenue = activeUsers.reduce((sum, user) => {
    const plan = user.subscriptionPlan || 'monthly'
    const price = SUBSCRIPTION_PRICING[plan] || SUBSCRIPTION_PRICING.monthly
    return sum + price
  }, 0)

  const pool = (revenue * PRIZE_POOL_PERCENT) / 100 + rollover
  return {
    total: pool,
    match5: pool * PRIZE_SPLIT.match5,
    match4: pool * PRIZE_SPLIT.match4,
    match3: pool * PRIZE_SPLIT.match3,
  }
}

function splitPrize(amount, count) {
  if (!count || amount <= 0) return 0
  return Number((amount / count).toFixed(2))
}

export {
  getMonthKey,
  generateRandomNumbers,
  generateWeightedNumbers,
  evaluateWinners,
  calculatePool,
  splitPrize,
}
