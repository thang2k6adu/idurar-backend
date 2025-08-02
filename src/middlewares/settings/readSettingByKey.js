import mongoose from 'mongoose'

export const readSettingByKey = async ({ settingKey }) => {
  try {
    const SettingModel = mongoose.model('Setting')

    if (!settingKey) {
      return null
    }

    const result = await SettingModel.findOne({ settingKey }).exec()

    if (!result) {
      return null
    } else {
      return result
    }
  } catch (error) {
    return null
  }
}
