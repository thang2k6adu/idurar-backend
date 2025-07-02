const useAppSettings = () => {
  let settings = {}
  settings['idurar_app_mail'] = process.env.EMAIL_FROM
  settings['idurar_base_url'] = 'http://localhost:8888/api'

  return settings
}

export default useAppSettings