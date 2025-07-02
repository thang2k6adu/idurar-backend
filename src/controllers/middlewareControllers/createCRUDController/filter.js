// Filter documents based on certain conditions
export const filter = async (Model, req, res) => {
  // GET /api/users/filter?filter=role&equal=admin
  if (req.query.filter === undefined || req.query.equal === undefined) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Filter and equal are required',
    })
  }

  const result = await Model.find({
    removed: false,
  })
    .where(req.query.filter)
    .equals(req.query.equal)
    .exec()

  if (!result) {
    return res.status(200).json({
      success: false,
      result: null,
      message: 'No document found',
    })
  }
}
