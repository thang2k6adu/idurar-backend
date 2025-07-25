import mongoose from 'mongoose'
import { createCRUDController } from '~/controllers/middlewareControllers/createCRUDController'

const methods = createCRUDController('PaymentMode')
const PaymentModeModel = mongoose.model('PaymentModel')

methods.create = async (req, res) => {
  const { isDefault, enabled } = req.body

  if (isDefault) {
    await PaymentModeModel.updateMany({}, { isDefault: false })
  }

  const countDefault = await PaymentModeModel.countDocuments({
    isDefault: true,
  })

  const result = await new PaymentModeModel({
    ...req.body,
    isDefault: countDefault < 1 ? true : false,
    enabled: countDefault < 1 || isDefault ? true : enabled,
  })

  return res.status(201).json({
    success: true,
    result,
    message: 'Payment mode created successfully',
  })
}

methods.delete = async (req, res) => {
  return res.status(400).json({
    success: false,
    result: null,
    message: 'You cannot delete payment mode after it has been created',
  })
}

methods.update = async (req, res) => {
  const { _id } = req.params
  const paymentMode = await PaymentModeModel.findOne({
    _id: req.params._id,
    removed: false,
  }).exec()

  const { isDefault = paymentMode.isDefault, enabled = paymentMode.enabled } =
    req.body

  // ne = not equal
  // ensure a record is default and enabled
  if (!isDefault || (!enabled && isDefault)) {
    await PaymentModeModel.findOneAndUpdate(
      {
        _id: { $ne: _id },
        enabled: true,
      },
      {
        isDefault: true,
      }
    )
  }

  if ((isDefault && enabled) || isDefault) {
    await PaymentModeModel.updateMany(
      { _id: { $ne: _id } },
      { isDefault: false}
    )
  }

  const paymentModeCount = await PaymentModeModel.countDocuments({})

  if ((!enabled || isDefault) && paymentModeCount <= 1) {
    return res.status(400).json({
      success: false,
      result: null,
      message:
        'You cannot disable this payment mode because it is the only existing one',
    })
  }

  const result = await PaymentModeModel.findOneAndUpdate(
    { _id },
    { ...req.body, enabled: isDefault ? true : enabled },
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

export const paymentModeController = methods