import mongoose from 'mongoose'

const TaxesSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  taxName: {
    type: String,
    required: true,
  },
  taxValue: {
    type: Number,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
  },
})

export const Taxes = mongoose.model('Taxes', TaxesSchema)
