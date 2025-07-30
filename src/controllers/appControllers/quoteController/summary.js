// summary of invoices
// different from normal summary, this file:
// 1. Determine summary type (week, month, year)
// 2. Calculate total invoice (total money, total documents),
//  total by status (total documents) group by (draft, pending, sent, refunded, cancelled, on hold),
//  total by paymentStatus (total documents) group by (unpaid, partially, paid)
//  total by overdue (total documents) (expired < current date) group by (draft, pending, sent, refunded, cancelled, on hold)
// 3. Calculate performance ( item.count / totalInvoice.count * 100)
// (percentage of each status eg draft: 10%, pending: 20%, sent: 30%, refunded: 40%, cancelled: 50%, on hold: 60%)
// 4. Calculate total overdue (set all status eg draft to overdue)
// 5. Calculate total unpaid ($sum:total - credit) (unpaid: total - credit, partially: credit)
// 6. Return the result
// (total, totalUndue, type, performance(array of object(status, count, percentage)))
import mongoose from 'mongoose'
import moment from 'moment'

import { loadSettings } from '~/middlewares/settings'

export const summary = async (req, res) => {
  const QuoteModel = mongoose.model('Quote')

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
  let startDate = currentDate.clone().startOf(defaultType)
  let endDate = currentDate.clone().endOf(defaultType)

  const statuses = [
    'draft',
    'pending',
    'sent',
    'expired',
    'declined',
    'accepted',
  ]

  const result = await QuoteModel.aggregate([
    {
      $match: {
        removed: false,
        // date: {
        //   $gte: startDate,
        //   $lte: endDate,
        // },
      },
    },
    {
      $group: {
        _id: '$status',
        count: {
          $sum: 1,
        },
        total_amount: {
          $sum: '$total',
        },
      },
    },
    {
      $group: {
        _id: null,
        total_count: {
          $sum: '$count',
        },
        results: {
          $push: '$$ROOT',
        },
      },
    },
    {
      // split a array into multiple documents ()
      $unwind: '$results',
    },
    {
      $project: {
        _id: 0,
        status: '$results._id',
        count: '$results.count',
        percentage: {
          // math expressions like round, multiplym devide,... are all accepted an array as an argument
          $round: [
            {
              $multiply: [{ $divide: ['$results.count', '$total_count'] }, 100],
            },
            // round the result to 0 decimal places
            0,
          ],
        },
        total_amount: '$results.total_amount',
      },
    },
    {
      $sort: {
        status: 1,
      },
    },
  ])

  statuses.forEach((status) => {
    const found = result.find((item) => item.status === status)
    if (!found) {
      result.push({
        status,
        count: 0,
        percentage: 0,
        total_amount: 0,
      })
    }
  })

  const total = result.reduce((acc, item) => acc + item.total_amount, 0)

  const finalResult = {
    total,
    type: defaultType,
    performance: result,
  }

  return res.status(200).json({
    success: true,
    result: finalResult,
    message: `Successfully get summary of ${defaultType} quotes`,
  })
}
