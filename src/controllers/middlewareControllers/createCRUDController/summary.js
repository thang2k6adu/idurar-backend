// create statistical summary report
export const summary = async (Model, req, res) => {
  const countAllDocumentsPromise = Model.countDocuments({
    removed: false,
  })
  const countDocumentsByFilterPromise = Model.countDocuments({
    removed: false,
  })
    .where(req.query.filter)
    .equals(req.query.equal)

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
