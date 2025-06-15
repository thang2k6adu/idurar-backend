import mongoose from 'mongoose'

const userPasswordSchema = new mongoose.Schema(
  {
    // ObjectId is not a JS type, it's a mongoose type
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    password: { type: String, required: true },
    loggedSessions: [{ type: String }],
    emailVerified: { type: Boolean, default: false },
    emailToken: { type: String },
    resetToken: { type: String },
    removed: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const UserPassword = mongoose.model('UserPassword', userPasswordSchema)
