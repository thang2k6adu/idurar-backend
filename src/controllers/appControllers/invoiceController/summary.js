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

const InvoiceModel = mongoose.model('Invoice')
import { loadSettings } from '~/middlewares/settings'

export const summary = async (req, res) => {
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
    'overdue',
    'paid',
    'unpaid',
    'partially',
  ]

  const response = await InvoiceModel.aggregate([
    {
      $match: {
        removed: false,
        // date: {
        //   $gte: startDate,
        //   $lte: endDate,
        // }
      },
    },
    {
      $facet: {
        totalInvoice: [
          {
            $group: {
              _id: null,
              total: {
                $sum: '$total',
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              total: '$total',
              count: '$count',
            },
          },
        ],
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              status: '$_id',
              count: '$count',
            },
          },
        ],
        paymentStatusCounts: [
          {
            $group: {
              _id: '$paymentStatus',
              count: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              status: '$_id',
              count: '$count',
            },
          },
        ],
        overdueCounts: [
          {
            $match: {
              removed: false,
              expiredDate: {
                $lt: new Date(),
              },
            },
          },
          {
            $group: {
              _id: '$status',
              count: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              status: '$_id',
              count: '$count',
            },
          },
        ],
      },
    },
  ])

  let result = []

  const totalInvoice = response[0].totalInvoice || { total: 0, count: 0 }
  const statusResult = response[0].statusCounts || []
  const paymentStatusResult = response[0].paymentStatusCounts || []
  const overdueResult = response[0].overdueCounts || []

  const statusResultMap = statusResult.map((item) => ({
    ...item,
    // Division by zero error
    percentage:
      totalInvoice.count > 0
        ? Math.round((item.count / totalInvoice.count) * 100)
        : 0,
  }))

  const paymentStatusResultMap = paymentStatusResult.map((item) => ({
    ...item,
    // Division by zero error
    percentage:
      totalInvoice.count > 0
        ? Math.round((item.count / totalInvoice.count) * 100)
        : 0,
  }))

  // const overdueCount = overdueResult.reduce((acc, item) => acc + item.count, 0);
  // const overdueResultMap = overdueCount > 0 ? [{
  //   status: 'overdue',
  //   count: overdueCount,
  //   percentage: Math.round((overdueCount / totalInvoices.count) * 100),
  // }] : [];

  const overdueResultMap = overdueResult.map((item) => ({
    ...item,
    status: 'overdue',
    // Division by zero error
    percentage:
      totalInvoice.count > 0
        ? Math.round((item.count / totalInvoice.count) * 100)
        : 0,
  }))

  statuses.forEach((status) => {
    const found = [
      ...paymentStatusResultMap,
      ...statusResultMap,
      ...overdueResultMap,
    ].find((item) => item.status === status)
    if (found) {
      result.push(found)
    }
  })

  const unpaid = await InvoiceModel.aggregate([
    {
      $match: {
        removed: false,
        // date: {
        //   $gte: startDate,
        //   $lte: endDate,
        // }
        paymentStatus: {
          $in: ['unpaid', 'partially'],
        },
      },
    },
    {
      $group: {
        _id: null,
        total_amount: {
          $sum: {
            $subtract: ['$total', '$credit'],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        total_amount: '$total_amount',
      },
    },
  ])

  const finalResult = {
    total: totalInvoice.total,
    // unpaid is a array because aggregate return array (1 item in this case)
    total_undue: unpaid.length > 0 ? unpaid[0].total_amount : 0,
    type: defaultType,
    performance: result,
  }

  return res.status(200).json({
    success: true,
    result: finalResult,
    message: `Successfully found all invoices for the last ${type}`,
  })
}
