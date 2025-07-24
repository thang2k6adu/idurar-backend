// difference from original:
// 1. add type filter by week, month, year
// 2. aggregate to get toal amount and count number of payment documents
// 3. return the result in the format of {count: number, total: number}
// 4. optional: add settings
import mongoose from 'mongoose'
import moment from 'moment'
import { loadSettings } from '~/middlewares/settings'

export const summary = async (req, res) => {
  const PaymentModel = mongoose.model('Payment')
  let defaultType = 'month'

  const { type } = req.query
  const settings = await loadSettings()

  if (type) {
    if (['week', 'month', 'year'].includes(type)) {
      defaultType = type
    } else {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid type',
      })
    }
  }

  const currentDate = moment()
  const startDate = currentDate.clone().startOf(defaultType)
  const endDate = currentDate.clone().endOf(defaultType)

  // get total amount and count number of payments
  const result = await PaymentModel.aggregate([
    {
      $match: {
        removed: false,
        // date: {
        //   // toDate is JS Date object
        //   $gte: startDate.toDate(),
        //   $lte: endDate.toDate(),
        // }
      },
    },
    {
      $group: {
        _id: null,
        count: {
          $sum: 1,
        },
        total: {
          $sum: '$amount',
        },
      },
    },
    {
      $project: {
        _id: 0,
        count: 1,
        total: 1,
      },
    },
  ])

  return res.status(200).json({
    success: true,
    result: result.length > 0 ? result[0] : { count: 0, total: 0 },
    message: `Successfully fetched the summary of payments for the last ${defaultType}`,
  })
}
