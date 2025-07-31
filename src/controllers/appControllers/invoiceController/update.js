// update a document by id
// different from normal update, this file:
// 1. validate input
// 2. extract key fields
// 3. Calculate invoice totals (item.total = quantity * price, taxTotal =  subtotal * (taxRate / 100))
// 4. Determine payment status
// 5. Append paymentStatus, createdBy and the calculated fields to the body
// 6. generate pdf file
// 7. Return the result
//  this file like create.js but without create new invoice
// Update invoice have to calculate total, check status (like create.js) again because user can change item, taxRate, discount
import mongoose from 'mongoose'
import { calculate } from '~/helpers'
import { schema } from './schemaValidate'
// import { custom } from '~/controllers/pdfController'

export const update = async (req, res) => {
  const InvoiceModel = mongoose.model('Invoice')

  let body = req.body

  const { error } = schema.validate(body)
  // ValidationError {
  //   message: string;
  //   details: Array<{
  //     message: string;
  //     path: Array<string | number>;
  //     type: string;
  //     context: {
  //       label: string;
  //       key: string;
  //       [key: string]: any;
  //     };
  //   }>;
  //   _original: any;
  // }
  if (error) {
    const { details } = error
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    })
  }

  const previousInvoice = await InvoiceModel.findOne({
    _id: req.params.id,
    removed: false,
  })

  const { credit } = previousInvoice

  const { items = [], taxRate = 0, discount = 0 } = req.body

  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Items cannot be empty',
    })
  }

  let subTotal = 0
  let taxTotal = 0
  let total = 0

  items.map((item) => {
    let total = calculate.multiply(item.quantity, item.price)
    subTotal = calculate.add(total, subTotal)

    item.total = total
  })

  taxTotal = calculate.multiply(subTotal, taxRate / 100)
  total = calculate.add(subTotal, taxTotal)

  body.subTotal = subTotal
  body.taxTotal = taxTotal
  body.total = total
  body.items = items
  body.pdf = 'invoice-' + req.params.id + '.pdf'

  if (body.hasOwnProperty('currency')) {
    delete body.currency
  }

  let paymentStatus =
    calculate.sub(total, discount) === 0
      ? 'paid'
      : credit > 0
        ? 'partially'
        : 'unpaid'
  body.paymentStatus = paymentStatus

  const result = await InvoiceModel.findOneAndUpdate(
    {
      _id: req.params.id,
      removed: false,
    },
    body,
    {
      new: true,
      runValidators: true,
    }
  ).exec()

  return res.status(200).json({
    success: true,
    result,
    message: 'Successfully updated invoice',
  })
}
