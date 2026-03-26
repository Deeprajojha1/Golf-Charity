import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    charityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity', required: false },
    charityContributionPercent: { type: Number, min: 10, max: 100, default: 10 },
    subscriptionPlan: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'lapsed'],
      default: 'active',
    },
    subscriptionRenewalDate: { type: Date, required: false },
    requestedRole: { type: String, enum: ['subscriber', 'admin'], default: 'subscriber' },
    scores: [
      {
        value: { type: Number, min: 1, max: 45, required: true },
        playedAt: { type: Date, required: true },
      },
    ],
    drawsEntered: { type: Number, default: 0 },
    totalWon: { type: Number, default: 0 },
    payoutStatus: {
      type: String,
      enum: ['pending', 'paid', 'none'],
      default: 'none',
    },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.model('User', userSchema)
