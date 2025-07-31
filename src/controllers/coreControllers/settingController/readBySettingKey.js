import mongoose from 'mongoose'

export const readBySettingKey = async (req, res) => {
  const SettingModel = mongoose.model('Setting')
  const settingKey = req.params.settingKey || undefined

  if (!settingKey) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'No settingKey provided',
    })
  }

  const result = await SettingModel.findOne({
    settingKey,
    removed: false,
  })

  if (result) {
    return res.status(200).json({
      success: true,
      result,
      message: 'Successfully found the document',
    })
  } else {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found',
    })
  }
}
