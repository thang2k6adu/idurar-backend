import mongoose from 'mongoose'
// import autopopulate from 'mongoose-autopopulate'

const ClientSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: String,
  country: String,
  address: String,
  email: String,
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    // autopopulate: true,
  },
  assigned: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    // autopopulate: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
})

// ClientSchema.plugin(autopopulate)

const Client = mongoose.model('Client', ClientSchema)
export default Client
