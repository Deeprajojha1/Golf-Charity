import mongoose from 'mongoose'

const drawSchema = new mongoose.Schema(
  {
    monthKey: { type: String, required: true },
    numbers: [{ type: Number, min: 1, max: 45 }],
    logicType: { type: String, enum: ['random', 'weighted'], default: 'random' },
    status: { type: String, enum: ['simulated', 'published'], default: 'published' },
    prizePoolTotal: { type: Number, default: 0 },
    prizePoolBreakdown: {
      match5: { type: Number, default: 0 },
      match4: { type: Number, default: 0 },
      match3: { type: Number, default: 0 },
      rollover: { type: Number, default: 0 },
    },
    publishedAt: { type: Date, required: false },
  },
  { timestamps: true },
)

export default mongoose.model('Draw', drawSchema)
