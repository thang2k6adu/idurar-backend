// remove a document by id
// different from normal remove, this file:
// 1. soft delete all payments related to the invoice
import mongoose from 'mongoose'

const InvoiceModel = mongoose.model('Invoice')
const PaymentModel = mongoose.model('Payment')

export const remove = async (req, res) => {
  const deletedInvoice = await InvoiceModel.findOneAndUpdate(
    {
      _id: req.params.id,
      removed: false,
    },
    {
      $set: {
        removed: true,
      },
    },
    { new: true }
  ).exec()

  if (!deletedInvoice) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found',
    })
  }

  await PaymentModel.updateMany(
    { invoice: deletedInvoice._id },
    { $set: { removed: true } }
  )

  return res.status(200).json({
    success: true,
    result: deletedInvoice,
    message: 'Invoice removed successfully',
  })
}
