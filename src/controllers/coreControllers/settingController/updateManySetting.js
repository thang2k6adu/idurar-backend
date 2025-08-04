import mongoose from 'mongoose'

export const updateManySetting = async (req, res) => {
  const SettingModel = mongoose.model('Setting')
  let settingHasError = false
  const updateDataArray = []

  const { settings } = req.body

  for (const setting of settings) {
    const { settingKey, settingValue } = setting

    if (!settingKey || !settingValue) {
      console.log(settingKey, settingValue)
      settingHasError = true
      break
    }

    updateDataArray.push({
      updateOne: {
        filter: {
          settingKey,
          removed: false,
        },
        update: {
          settingValue,
        },
      },
    })
  }

  if (updateDataArray.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'No settings provided',
    })
  }
  if (settingHasError) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Settings provided missing settingKey or settingValue',
    })
  }

  // Mongoose’s Model.bulkWrite() is a method
  // that allows you to perform many write operations at once (insertOne, updateOne, deleteOne)
  // Argument:
  // [
  //   {
  //     updateOne: {
  //       filter: { settingKey: 'siteTitle' },
  //       update: { settingValue: 'My App' },
  //     },
  //   },
  //   {
  //     updateOne: {
  //       filter: { settingKey: 'theme' },
  //       update: { settingValue: 'dark' },
  //     },
  //   },
  //   ...
  // ]
  const result = await SettingModel.bulkWrite(updateDataArray)
  // {
  // nMatched: 2,
  // nModified: 2,
  // nUpserted: 0,
  // upsertedCount: 0,
  // modifiedCount: 2,

  if (!result || result.nModified === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'No settings found to update',
    })
  } else {
    return res.status(200).json({
      success: true,
      result: [],
      message: 'Successfully updated the settings',
    })
  }
}
