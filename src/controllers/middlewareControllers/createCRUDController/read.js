// read a document by id
export const read = async (Model, req, res) => {
  // Find document by id
  const result = await Model.findOne({
    _id: req.params.id,
    removed: false,
  })

  // if no result found, return document not found
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found',
    })
  } else {
    // return success response
    return res.status(200).json({
      success: true,
      result,
      message: 'Get document successfully'
    })
  }
}
