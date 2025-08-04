import mongoose from 'mongoose'
import { createCRUDController } from '~/controllers/middlewareControllers/createCRUDController'

const methods = createCRUDController('Taxes')
const TaxesModel = mongoose.model('Taxes')

methods.create = async (req, res) => {
  const { isDefault } = req.body

  if (isDefault) {
    await TaxesModel.updateMany({}, { isDefault: false })
    req.body.enabled = true
  }

  const countDefault = await TaxesModel.countDocuments({
    isDefault: true,
  })

  const result = await new TaxesModel({
    ...req.body,
    isDefault: countDefault < 1 ? true : false,
  }).save()

  return res.status(200).json({
    success: true,
    result,
    message: 'Tax created successfully',
  })
}

methods.remove = async (req, res) => {
  return res.status(400).json({
    success: false,
    result: null,
    message: 'Cannot delete tax after it has been created',
  })
}

methods.update = async (req, res) => {
  const { _id } = req.params
  const tax = await TaxesModel.findOne({
    _id,
    removed: false,
  })
  const { isDefault = tax.isDefault, enabled = tax.enabled } = req.body

  const countDefault = await TaxesModel.countDocuments({
    _id: { $ne: _id },
    removed: false,
    isDefault: true,
  })

  if (!isDefault && countDefault < 1) {
    await TaxesModel.updateOne(
      { _id: { $ne: _id }, removed: false, enabled: true },
      {
        isDefault: true,
      }
    )
  }

  if (isDefault) {
    await TaxesModel.updateMany(
      {
        _id: { $ne: _id },
        removed: false,
      },
      {
        isDefault: false,
      }
    )

    req.body.enabled = true
  }

  const taxesCount = await TaxesModel.countDocuments({
    enabled: true,
  })

  if ((!enabled || !isDefault) && taxesCount <= 1) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Cannot disabled the tax because it is the only existing one',
    })
  }

  const result = await TaxesModel.findOneAndUpdate({ _id }, req.body, { new: true })

  return res.status(200).json({
    success: true,
    result,
    message: 'Tax updated successfully',
  })
}

export default methods