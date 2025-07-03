// Soft delete a document by mark removed: true
export const remove = async (Model, req, res) => {
  // Find the document by id and soft delete it
  let updates = {
    removed: true,
  }

  // Find the document by id and soft delete it
  const result = await Model.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    { $set: updates },
    { new: true }
  ).exec()

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
      message: 'Document removed successfully',
    })
  }
}
