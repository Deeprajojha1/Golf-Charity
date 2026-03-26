import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Draw from '../models/Draw.js'
import Winner from '../models/Winner.js'

dotenv.config({ path: '.env' })

function monthKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI)

  const player = await User.findOne({ email: 'player.demo@golfcharity.local' })
  if (!player) {
    throw new Error('Demo player not found')
  }

  player.scores = [10, 20, 30, 40, 45].map((value) => ({ value, playedAt: new Date() }))
  player.subscriptionStatus = 'active'
  await player.save()

  const draw = await Draw.create({
    monthKey: monthKey(),
    numbers: [10, 20, 30, 40, 45],
    logicType: 'weighted',
    status: 'published',
    prizePoolTotal: 100,
    prizePoolBreakdown: {
      match5: 40,
      match4: 35,
      match3: 25,
      rollover: 0,
    },
    publishedAt: new Date(),
  })

  const winner = await Winner.create({
    drawId: draw._id,
    userId: player._id,
    matchCount: 5,
    prizeAmount: 40,
    payoutStatus: 'pending',
    proof: {
      url: '',
      note: '',
      decisionNote: '',
    },
  })

  player.drawsEntered += 1
  player.totalWon += 40
  player.payoutStatus = 'pending'
  await player.save()

  console.log('demo-draw', String(draw._id))
  console.log('demo-winner', String(winner._id))

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
