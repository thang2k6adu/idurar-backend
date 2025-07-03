import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
const Schema = mongoose.Schema

const AdminPasswordSchema = new Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  emailToken: {
    type: String,
  },
  resetToken: {
    type: String,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  authType: {
    type: String,
    default: 'email',
  },
  loggedSessions: {
    type: [String],
    default: [],
  },
})

AdminPasswordSchema.methods.hashPassword = async (password) => {
  return await bcrypt.hash(password, 10)
}

AdminPasswordSchema.methods.isValidPassword = async (password) => {
  return await bcrypt.compare(password, this.password)
}
// const userPasswordSchema = new mongoose.Schema(
//   {
//     // ObjectId is not a JS type, it's a mongoose type
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     password: { type: String, required: true },
//     loggedSessions: [{ type: String }],
//     emailVerified: { type: Boolean, default: false },
//     emailToken: { type: String },
//     resetToken: { type: String },
//     removed: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// )

export const AdminPassword = mongoose.model('AdminPassword', AdminPasswordSchema)
