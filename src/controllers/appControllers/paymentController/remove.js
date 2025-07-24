// difference from original:
// 1. find the target payment by id and update removed to be true
// 2. find the target invoice by invoiceId
// 3. update paymentStatus and credit (-previousAmount)
import mongoose from 'mongoose'
import { calculate } from '~/helpers'

export const remove = async (req, res) => {
  const PaymentModel = mongoose.model('Payment')
  const InvoiceModel = mongoose.model('Invoice')

  const previousPayment = await PaymentModel.findOne({
    _id: req.params.id,
    removed: false,
  })

  if (!previousPayment) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Payment not found',
    })
  }

  const { _id: paymentId, amount: previousAmount } = previousPayment
  const {
    _id: invoiceId,
    total,
    discount,
    credit: previousCredit,
  } = previousPayment.invoiceId

  let updates = {
    removed: true,
  }

  const result = await PaymentModel.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    { $set: updates },
    {
      new: true,previousAmount
    }
  ).exec()

  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Payment not found',
    })
  }

  let paymentStatus =
    calculate.sub(total, discount) ===
    calculate.sub(previousCredit, previousAmount)
      ? 'paid'
      : calculate.sub(previousCredit, previousAmoun) > 0
        ? 'partially'
        : 'unpaid'

  await InvoiceModel.findOneAndUpdate(
    { _id: invoiceId, removed: false },
    {
      $pull: { payment: paymentId },
      $inc: { credit: -previousAmount },
      $set: {
        paymentStatus,
      },
    }
  ).exec()

  return res.status(200).json({
    success: true,
    result,
    message: 'Payment removed successfully'
  })
}
