import mongoose from 'mongoose'
import { createCRUDController } from '~/controllers/middlewareControllers/createCRUDController'

const methods = createCRUDController('PaymentMode')
const PaymentModeModel = mongoose.model('PaymentMode')

methods.create = async (req, res) => {
  const { isDefault } = req.body

  if (isDefault) {
    await PaymentModeModel.updateMany({}, { isDefault: false })
    req.body.enabled = true
  }

  const countDefault = await PaymentModeModel.countDocuments({
    isDefault: true,
  })

  const result = await new PaymentModeModel({
    ...req.body,
    isDefault: countDefault < 1 ? true : false,
  }).save()

  return res.status(201).json({
    success: true,
    result,
    message: 'Payment mode created successfully',
  })
}

methods.remove = async (req, res) => {
  return res.status(400).json({
    success: false,
    result: null,
    message: 'You cannot delete payment mode after it has been created',
  })
}

methods.update = async (req, res) => {
  const { id } = req.params
  const paymentMode = await PaymentModeModel.findOne({
    _id: id,
    removed: false,
  }).exec()

  const { isDefault = paymentMode.isDefault, enabled = paymentMode.enabled } = req.body
  // ne = not equal
  // ensure a record is default and enabled
  if (!isDefault || (!enabled && isDefault && paymentMode.isDefault)) {
    // fallback to the last enabled payment mode
    const fallback = await PaymentModeModel.findOne({
      _id: { $ne: id },
      removed: false,
      enabled: true,
    }).sort({ updatedAt: -1 }) // Ưu tiên cái mới nhất

    if (!fallback) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'You must have at least one enabled default payment mode',
      })
    }

    console.log('ok')
    req.body.isDefault = false
    if (!enabled) {
      req.body.enabled = false
    }
    await PaymentModeModel.updateOne({ _id: fallback._id }, { isDefault: true })
  }

  // avoid to update other payment mode when default is not changed
  if (!paymentMode.isDefault && isDefault) {
    await PaymentModeModel.updateMany({ _id: { $ne: id } }, { isDefault: false })
  }

  const paymentModeCount = await PaymentModeModel.countDocuments({})

  if ((!enabled || isDefault) && paymentModeCount <= 1) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'You cannot disable this payment mode because it is the only existing one',
    })
  }

  console.log(enabled)

  const result = await PaymentModeModel.findOneAndUpdate(
    { _id: id },
    { ...req.body, enabled },
    {
      new: true,
    }
  )

  return res.status(200).json({
    success: true,
    result,
    message: 'Payment mode updated successfully',
  })
}

export default methods
