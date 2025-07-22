// read a document by id
// different from normal read, this file:
// 1. find and populate by createdBy (name)
import mongoose from 'mongoose'

const InvoiceModel = mongoose.model('Invoice')

export const read = async (req, res) => {
  // find document by id
  const result = await InvoiceModel.findOne({
    _id: req.params.id,
    removed: false,
  })
    .populate('createdBy', 'name')
    .exec()

  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found',
    })
  } else {
    return res.status(200).json({
      success: true,
      result,
      message: 'Get document successfully',
    })
  }
}
