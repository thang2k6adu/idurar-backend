// update a document
export const update = async (Model, req, res) => {
  // Find document by id and updates with the required fields
  // avoid client to soft delete instead of update (only update, not remove)
  req.body.removed = false
  const result = await Model.findOneAndUpdate(
    {
      _id: req.params.id,
      removed: false,
    },
    req.body,
    {
      new: true, // return the new document instead of the old one
      runValidators: true, //run validators (model schema) on the update
    }
  )

  // result is new document after update
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Document not found',
    })
  } else {
    return res.status(200).json({
      success: true,
      result,
      message: 'Document update successfully',
    })
  }
}
