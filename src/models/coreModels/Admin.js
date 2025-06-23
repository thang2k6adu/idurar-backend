import mongoose from 'mongoose'
const Schema = mongoose.Schema

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     removed: { type: Boolean, default: false },
//     enabled: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// )

const AdminSchema = new Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
  },
  photo: {
    type: String,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    default: 'owner',
    enum: ['owner']
  }
})

// this instance will validate data before saving to the database (or create)
export const Admin = mongoose.model('Admin', AdminSchema)
