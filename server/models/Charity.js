import mongoose from 'mongoose'

const charitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    tags: [{ type: String }],
    images: [{ type: String }],
    featured: { type: Boolean, default: false },
    events: [
      {
        title: { type: String, default: '' },
        date: { type: Date },
        description: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true },
)

export default mongoose.model('Charity', charitySchema)
