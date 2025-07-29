import mongoose from 'mongoose'

export const read = async (req, res) => {
  const QuoteModel = mongoose.model('Quote')
  const result = await QuoteModel.findOne({
    _id: req.params._id,
    removed: false,
  })
    .populate('createdBy', 'name')
    .exec()

  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Quote not found'
    })
  } else {
    return res.status(200).json({
      success: true,
      result,
      message: 'Quote fetched successfully'
    })
  }
}
