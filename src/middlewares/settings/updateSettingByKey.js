import mongoose from 'mongoose'

export const updateSettingByKey = async ({ settingKey, settingValue }) => {
  try {
    const SettingModel = new mongoose.model('Setting')

    if (!settingKey || !settingValue) {
      return null
    }

    const result = await SettingModel.findOneAndUpdate(
      { settingKey },
      { settingValue },
      { new: true, runValidator: true }
    )

    if (!result) {
      return null
    } else {
      return result
    }
  } catch (error) {
    return null
  }
}
