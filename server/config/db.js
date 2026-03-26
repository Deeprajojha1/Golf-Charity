import mongoose from 'mongoose'

async function connectDB() {
  const uri = process.env.MONGO_URI
  if (!uri) {
    return { connected: false, reason: 'MONGO_URI not set' }
  }

  await mongoose.connect(uri)
  return { connected: true }
}

export { connectDB }
