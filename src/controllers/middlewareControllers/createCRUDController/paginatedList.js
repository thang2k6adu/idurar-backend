// get document list based on pagination (optimize user experience: eg get 10 user in page 2 instead of list all)
export const paginatedList = async (Model, req, res) => {
  // GET /api/users?page=2&items=5
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  // eg: page 2, limit 10 => skip = 10
  const skip = page * limit - limit

  // GET /api/users?sortBy=name&sortValue=1&filter=role&equal=admin
  // /search?q=thang&queryConditions=name,email
  const { sortBy = 'enabled', sortValue = -1, filter, equal } = req.query
  const sort = { [sortBy]: parseInt(sortValue) }

  const fieldsArray = req.query.queryConditions
    ? req.query.queryConditions.split(',')
    : []

  let queryConditions = {}

  if (fieldsArray.length > 0 && req.query.q) {
    queryConditions.$or = fieldsArray.map((field) => ({
      [field]: { $regex: new RegExp(req.query.q, 'i') },
    }))
  }

  if (filter && equal) {
    queryConditions[filter] = equal
  }

  // Query the database for a list of all results
  const resultsPromise = Model.find({
    removed: false,
    ...queryConditions,
  })
    .skip(skip) // skip first n documents
    .limit(limit) // limit n documents
    // .sort({ createdAt: -1 }) // sắp xếp theo ngày tạo, mới nhất trước
    // .sort({ name: 1 }) // sắp xếp theo tên A → Z
    .sort(sort) // sort by field
    .populate()
    .exec()

  // count total documents

  const countDocumentsPromise = Model.countDocuments({
    removed: false,
    // [filter]: equal,
    ...queryConditions,
  })

  const [results, totalDocuments] = await Promise.all([
    resultsPromise,
    countDocumentsPromise,
  ])

  // Calculate total pages
  const totalPages = Math.ceil(totalDocuments / limit)

  // Get pagination info
  const pagination = { page, totalPages, totalDocuments }

  return res.status(200).json({
    success: true,
    result: results,
    pagination,
    message:
      totalDocuments > 0
        ? 'Successfully found all documents'
        : 'No documents found by this request',
  });
}
