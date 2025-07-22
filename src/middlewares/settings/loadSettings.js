import { listAllSettings } from './listAllSettings'

export const loadSettings = async () => {
  const allSettings = {}
  const datas = await listAllSettings()

  datas.forEach(({ settingKey, settingValue }) => {
    allSettings[settingKey] = settingValue
  })

  return allSettings
}
