// instead of normally create data, this file:
// 1. validate input
// 2. extract key fields
// 3. Calculate invoice totals (item.total = quantity * price, taxTotal =  subtotal * (taxRate / 100))
// total = subTotal + taxTotal
// 4. Determine payment status
// 5. Append paymentStatus, createdBy and the calculated fields to the body
// 6. Save Invoice to get Id and generate pdf file
// 7. Increase last_invoice_number setting key (count the number of invoice)
// 8. Return the result
import mongoose from 'mongoose'
import { calculate } from '~/helpers'
import { schema } from './schemaValidate'
import { increaseBySettingKey } from '~/middlewares/settings/increaseBySettingKey'

export const create = async (req, res) => {
  const InvoiceModel = mongoose.model('Invoice')
  let body = req.body

  const { error, value } = schema.validate(body)

  if (error) {
    const { details } = error
    return res.status(400).json({
      success: false,
      result: null,
      // can be multiple errors, so we need to get the first one
      message: details[0]?.message,
    })
  }

  // discount in this case was not in the schema
  const { items = [], taxRate = 0, discount = 0 } = value

  let subTotal = 0
  let taxTotal = 0
  let total = 0

  // Calculate the items array wit subTotal, total, taxTotal
  items.forEach((item) => {
    let total = calculate.multiply(item.quantity, item.price)

    subTotal = calculate.add(subTotal, total)

    item.total = total
  })

  taxTotal = calculate.multiply(subTotal, taxRate / 100)
  total = calculate.add(subTotal, taxTotal)

  body.subTotal = subTotal
  body.taxTotal = taxTotal
  body.total = total
  body.items = items

  let paymentStatus = calculate.sub(total, discount) === 0 ? 'paid' : 'unpaid'

  body.paymentStatus = paymentStatus
  body.createdBy = req.admin._id

  // const _id = new mongoose.Types.ObjectId()
  // const fileId = 'invoice-' + _id + '.pdf'

  // const result = await new InvoiceModel({
  //   ...body,
  //   _id,
  //   pdf: fileId
  // }).save()

  // return res.status(200).json({
  //   success: true,
  //   result,
  //   message: 'Invoice created successfully',
  // })

  const result = await new InvoiceModel(body).save()
  const fileId = 'invoice-' + result._id + '.pdf'
  const updateResult = await InvoiceModel.findOneAndUpdate(
    { _id: result._id },
    { pdf: fileId },
    { new: true }
  ).exec()

  increaseBySettingKey({
    settingKey: 'last_invoice_number',
  })

  return res.status(200).json({
    success: true,
    result: updateResult,
    message: 'Invoice created successfully',
  })
}
