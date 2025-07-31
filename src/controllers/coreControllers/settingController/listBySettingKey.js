import mongoose from 'mongoose'

export const listBySettingKey = async (req, res) => {
  const SettingModel = mongoose.model('Setting')

  // /api/settings?settingKeyArray=settingKey1,settingKey2,settingKey3
  const settingKeyArray = req.query.settingKeyArray
    ? req.query.settingKeyArray.split(',')
    : []

  const settingsToShow = { $or: [] }

  if (settingKeyArray.length === 0) {
    return res.status(400).json({
      success: false,
      result: [],
      message: 'Setting key array is required',
    })
  }

  for (const settingKey of settingKeyArray) {
    // [
    //   { settingKey: 'settingKey1' },
    //   { settingKey: 'settingKey2' },
    //   { settingKey: 'settingKey3' },
    // ]
    settingsToShow.$or.push({ settingKey })
  }

  const results = await SettingModel.find(settingsToShow).where('removed', false)

  if (results.length > 0) {
    return res.status(200).json({
      success: true,
      result: results,
      message: 'Successfully found all documents',
    })
  } else {
    return res.status(404).json({
      success: false,
      result: [],
      message: 'No documents found',
    })
  }
}
