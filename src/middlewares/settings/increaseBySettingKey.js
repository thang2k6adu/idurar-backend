import mongoose from 'mongoose'

const SettingModel = mongoose.model('Setting')

export const increaseBySettingKey = async ({ settingKey }) => {
  try {
    if (!settingKey) {
      return null
    }

    const result = await SettingModel.findOneAndUpdate(
      { settingKey },
      { $inc: { settingValue: 1 } },
      { new: true, runValidators: true }
    ).exec()

    if (!result) {
      return null
    } else {
      return result
    }
  } catch (error) {
    return null
  }
}
