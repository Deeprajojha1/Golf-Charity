import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User.js'

dotenv.config({ path: '.env' })

async function main() {
  await mongoose.connect(process.env.MONGO_URI)
  const result = await User.updateOne(
    { email: 'admin.demo@golfcharity.local' },
    { $set: { isAdmin: true, subscriptionStatus: 'active' } },
  )
  console.log('admin-updated', result.modifiedCount)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
