const useAppSettings = () => {
  let settings = {}
  settings['idurar_app_mail'] = process.env.EMAIL_FROM
  settings['idurar_base_url'] = 'http://localhost:5173'

  return settings
}

export default useAppSettings