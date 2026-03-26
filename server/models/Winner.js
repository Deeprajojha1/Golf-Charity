import mongoose from 'mongoose'

const winnerSchema = new mongoose.Schema(
  {
    drawId: { type: mongoose.Schema.Types.ObjectId, ref: 'Draw', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchCount: { type: Number, min: 3, max: 5, required: true },
    prizeAmount: { type: Number, default: 0 },
    payoutStatus: { type: String, enum: ['pending', 'paid', 'rejected'], default: 'pending' },
    proof: {
      url: { type: String, default: '' },
      note: { type: String, default: '' },
      submittedAt: { type: Date },
      reviewedAt: { type: Date },
      decisionNote: { type: String, default: '' },
    },
  },
  { timestamps: true },
)

export default mongoose.model('Winner', winnerSchema)
