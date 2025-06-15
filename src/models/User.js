import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    removed: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// this instance will validate data before saving to the database (or create)
export const User = mongoose.model('User', userSchema)