// difference from original:
// 1. check amount is not 0
// 2. find the target invoice by invoicId
// 3. extract key fields to calculate unpaidAmount (amount cannot exceed unpaidAmount)
// 4. based on the unpaidAmount, check paymentStatus (paid, partially, unpaid)
// 5. generate pdf file name, createdBy
// 6. update corresponding invoice (paymentStatus, credit)
import mongoose from 'mongoose'
import { calculate } from '~/helpers'

export const create = async (req, res) => {
  const PaymentModel = mongoose.model('Payment')
  const InvoiceModel = mongoose.model('Invoice')

  if (req.body.amount === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'The Minimum Amount could not be 0',
    })
  }

  const currentInvoice = await InvoiceModel.findOne({
    _id: req.body.invoice,
    removed: false,
  })

  const {
    total: previousTotal,
    discount: previousDiscount,
    credit: previousCredit,
  } = currentInvoice

  const unpaidAmount = calculate.sub(
    calculate.sub(previousTotal, previousDiscount),
    previousCredit
  )

  if (req.body.amount > unpaidAmount) {
    return res.status(400).json({
      success: false,
      result: null,
      message: `The max amount you can add is ${unpaidAmount}`,
    })
  }

  req.body.createdBy = req.admin._id

  const _id = new mongoose.Types.ObjectId()
  const fileId = 'payment-' + _id + '.pdf'

  const result = await new PaymentModel({
    ...req.body,
    _id,
    pdf: fileId,
  }).save()

  // const result = await new PaymentModel(req.body).save()

  // const fileId = 'payment-' + result._id + '.pdf'
  // const updatePath = await PaymentModel.findOneAndUpdate(
  //   {
  //     _id: result._id.toString(),
  //     removed: false,
  //   },
  //   {
  //     pdf: fileId,
  //   },
  //   {
  //     new: true,
  //   }
  // ).exec()

  const { _id: paymentId, amount } = result

  let paymentStatus =
    calculate.sub(previousTotal, previousDiscount) ===
    calculate.add(previousCredit, amount)
      ? 'paid'
      : calculate.add(previousCredit, amount) > 0
        ? 'partially'
        : 'unpaid'

  await InvoiceModel.findOneAndUpdate(
    {
      _id: req.body.invoice,
      removed: false,
    },
    {
      $push: { payment: paymentId.toString() },
      $inc: { credit: amount },
      $set: { paymentStatus: paymentStatus },
    },
    {
      new: true,
      runValidators: true,
    }
  ).exec()

  return res.status(200).json({
    success: true,
    result,
    message: 'Payment Invoice created successfully',
  })
}
