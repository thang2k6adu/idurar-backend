import mongoose from 'mongoose'

const PaymentModeSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true,
  },
  ref: {
    type: String,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
})

const PaymentMode = mongoose.model('PaymentMode', PaymentModeSchema)
export default PaymentMode
