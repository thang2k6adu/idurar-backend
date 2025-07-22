import mongoose from 'mongoose'

const SettingModel = mongoose.model('Setting')

export const listAllSettings = async () => {
  try {
    // Query the database for a list of all settings
    const result = await SettingModel.find({
      removed: false,
    }).exec()

    if (result.length > 0) {
      return result
    } else {
      return []
    }
  } catch {
    return []
  }
}