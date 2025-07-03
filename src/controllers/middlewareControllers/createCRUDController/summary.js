// create statistical summary report
export const summary = async (Model, req, res) => {
  const countAllDocumentsPromise = Model.countDocuments({
    removed: false,
  })

  const { filter, equal } = req.query

  let filterQuery = { removed: false }

  if (filter && equal) {
    filterQuery[filter] = equal
  }

  const countDocumentsByFilterPromise = Model.countDocuments(filterQuery)

  const [countAllDocuments, countDocumentsByFilter] = await Promise.all([
    countAllDocumentsPromise,
    countDocumentsByFilterPromise,
  ])

  return res.status(200).json({
    success: true,
    result: { countAllDocuments, countDocumentsByFilter },
    message:
      countAllDocuments > 0
        ? 'Successfully count all documents'
        : 'No documents found by this request',
  })
}
