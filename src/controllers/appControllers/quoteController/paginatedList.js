// get document list based on pagination (optimize user experience: eg get 10 user in page 2 instead of list all)
// different from normal list, this file:
// 1. find and populate by createdBy (name)
import mongoose from 'mongoose'
import { escapeRegex } from '~/helpers'

export const paginatedList = async (req, res) => {
  const QuoteModel = mongoose.model('Quote')

  const page = Math.max(parseInt(req.query.page) || 1, 1)
  // A limit = 0 might cause error
  const limit = Math.max(parseInt(req.query.limit) || 10, 1)
  const skip = (page - 1) * limit

  const { sortBy = 'enabled', sortValue = -1, filter, equal } = req.query

  const sort = { [sortBy]: sortValue }

  // /api/settings?q=thang&fields=settingKey,settingCategory
  const fieldsArray = req.query.fields ? req.query.fields.split(',') : []

  let queryConditions = {}

  if (fieldsArray.length > 0 && req.query.q) {
    queryConditions.$or = fieldsArray.map((field) => ({
      [field]: { $regex: new RegExp(escapeRegex(req.query.q), 'i') },
    }))
  }

  if (filter && equal) {
    queryConditions[filter] = equal
  }

  const resultsPromise = QuoteModel.find({
    removed: false,
    ...queryConditions,
  })
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .populate('createdBy', 'name')
    .exec()

  const countPromise = InvoiceModel.countDocuments({
    removed: false,
    ...queryConditions,
  })

  const [results, totalDocuments] = await Promise.all([
    resultsPromise,
    countPromise,
  ])

  // Calculate total pages
  const totalPages = Math.ceil(totalDocuments / limit)

  const pagination = { page, totalPages, totalDocuments }


  return res.status(200).json({
    success: true,
    result: results,
    pagination,
    message:
      totalDocuments > 0
        ? 'Successfully found all documents'
        : 'No documents found by this request',
  })
}
