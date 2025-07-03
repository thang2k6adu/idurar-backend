// get all document without pagination
export const listAll = async (Model, req, res) => {
  const sort = req.query.sort || 'desc'
  const enabledRaw = req.query.enabled
  const enabled =
    enabledRaw === 'true' ? true : enabledRaw === 'false' ? false : undefined
  let results

  if (enabled === undefined) {
    results = await Model.find({
      removed: false,
    })
      .sort({ created: sort })
      .populate() // no need to populate
      .exec()
  } else {
    results = await Model.find({
      removed: false,
      enabled: enabled,
    })
      .sort({ created: sort })
      .populate()
      .exec()
  }

  // const hasResults = Array.isArray(results) && results.length > 0

  return res.status(200).json({
    success: results?.length > 0,
    result: results ? results : [],
    message:
      results.length > 0
        ? 'Successfully found all documents'
        : 'No documents found by this request',
  })
}
