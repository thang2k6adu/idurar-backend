// Filter documents based on certain conditions
export const filter = async (Model, req, res) => {
  // GET /api/users/filter?filter=role&equal=admin
  // if dont control not allowed fields (password, etc), it will be a security issue
  if (req.query.filter === undefined || req.query.equal === undefined) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Filter and equal are required',
    })
  }

  const results = await Model.find({
    removed: false,
  })
    .where(req.query.filter)
    .equals(req.query.equal)
    .exec()

  if (results.length === 0) {
    return res.status(200).json({
      success: false,
      result: null,
      message: 'No document found',
    })
  } else {
    return res.status(200).json({
      success: true,
      result: results,
      message: 'Successfully filtered the documents',
    })
  }
}
