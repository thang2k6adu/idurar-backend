// difference from the original:
// 1. Check the amount is not 0
// 2. Find the target payment by id and get the previous amount
// 3. Based on previousAmount, calculate the changedAmount (check if changedAmount exceeds unpaidAmount)
// essentially, the changedAmount cannot exceed unpaidAmount + previousAmount
// 4. Update Payment with data from request body
// 5. Based on changedAmount, update the the corresponding invoice 
// (paymentStatus (unpaid = credit + changed), credit (+ changedAmount))

import mongoose from 'mongoose'
import { calculate } from '~/helpers'

// import { custom } from '~/controllers/pdfController'

export const update = async (req, res) => {
  const PaymentModel = mongoose.model('Payment')
  const InvoiceModel = mongoose.model('Invoice')

  if (req.body.amount === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'The minimum amount could not be 0',
    })
  }

  const newAmount = req.body.amount

  const previousPayment = await PaymentModel.findOne({
    _id: req.params.id,
    removed: false,
  })

  const { amount: previousAmount } = previousPayment
  const {
    _id: invoiceId,
    total,
    discount,
    credit: previousCredit,
  } = previousPayment.invoice

  const changedAmount = calculate.sub(newAmount, previousAmount)
  const unpaidAmount = calculate.sub(
    total,
    calculate.add(discount, previousCredit)
  )

  if (changedAmount > unpaidAmount) {
    return res.status(400).json({
      success: false,
      result: null,
      message: `The max amount you can add is ${unpaidAmount + previousAmount}`,
      error: `The max amount you can add is ${unpaidAmount + previousAmount}`,
    })
  }

  let paymentStatus =
    calculate.sub(total, discount) ===
    calculate.add(previousCredit, changedAmount)
      ? 'paid'
      : calculate.add(previousCredit, changedAmount) > 0
        ? 'partially'
        : 'unpaid'

  const updatedDate = new Date()
  const updates = {
    number: req.body.number,
    date: req.body.date,
    amount: req.body.amount,
    paymentMode: req.body.paymentMode,
    ref: req.body.ref,
    description: req.body.description,
    updated: updatedDate,
  }

  const result = await PaymentModel.findOneAndUpdate(
    {
      _id: req.params.id,
      removed: false,
    },
    { $set: updates },
    { new: true }
  ).exec()

  await InvoiceModel.findOneAndUpdate(
    { _id: invoiceId, removed: false },
    { $set: { paymentStatus: paymentStatus }, $inc: { credit: changedAmount } },
    { new: true }
  ).exec()

  return res.status(200).json({
    success: true,
    result,
    message: 'Successfully update payment',
  })
}
