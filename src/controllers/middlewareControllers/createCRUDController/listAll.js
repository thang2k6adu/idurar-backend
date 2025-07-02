// get all document without pagination
export const listAll = async (Model, req, res) => {
  const sort = req.query.sort || 'desc'
  const enabled = req.query.enabled || undefined

  let result

  if (enabled) {
    result = await Model.find({
      removed: false,
      enabled: enabled,
    })
      .sort({ created: sort })
      .populate() // no need to populate
      .exec()
  } else { 
    result = await Model.find({
      removed: false,
    })
      .sort({ created: sort })
      .populate()
      .exec()
  }

  return res.status(200).json({
    success: result.length > 0,
    result: result ? result : [],
    message:
      result.length > 0
        ? 'Successfully found all documents'
        : 'No documents found by this request',
  })
}
