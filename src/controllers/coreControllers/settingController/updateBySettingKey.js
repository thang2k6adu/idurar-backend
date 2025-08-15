import mongoose from 'mongoose'

export const updateBySettingKey = async (req, res) => {
  const SettingModel = mongoose.model('Setting')
  const settingKey = req.params.settingKey

  if (!settingKey) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'No settingKey provided',
    })
  }

  const { settingValue, photo } = req.body

  if (!settingValue && !photo) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'No settingValue provided',
    })
  }

  const result = await SettingModel.findOneAndUpdate(
    {
      settingKey,
      removed: false,
    },
    {
      settingValue: settingValue || photo,
    },
    {
      new: true,
    }
  ).exec()

  if (result) {
    return res.status(200).json({
      success: true,
      result,
      message: 'Successfully updated the document',
    })
  } else {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found',
    })
  }
}
