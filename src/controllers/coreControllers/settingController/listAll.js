import mongoose from 'mongoose'

export const listAll = async (req, res) => {
  const SettingModel = mongoose.model('Setting')
  const { sort } = parseInt(req.query.sort) || 'desc'

  const result = await SettingModel.find({
    removed: false,
    isPrivate: false,
  }).sort({ created: sort })

  return res.status(200).json({
    success: true,
    result: result || [],
    message: result.length > 0 ? 'Successfully found all documents' : 'No documents found'
  })
}