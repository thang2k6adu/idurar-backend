import { readSettingByKey } from '~/middlewares/settings'

const getLabel = (lang, key) => {
  try {
    const lowerCaseKey = key
      .toLowerCase()
      // replace all character that are not letters or numbers with underscores
      // eg: Sign up -> sign_up_
      .replace(/[^a-zA-Z0-9]/g, '_')

    if (lang[lowerCaseKey]) return lang[lowerCaseKey]
    else {
      const removeUnderscoreFromKey = lowerCaseKey.replace(/_/g, ' ').split(' ')

      const firstCharUpper = removeUnderscoreFromKey.map(
        (word) => word[0].toUpperCase() + word.substring(1)
      )

      const label = firstCharUpper.join(' ')

      return label
    }
  } catch (error) {
    return error
  }
}

const useSelector = (selectedLang = 'en') => {
  const langMap = {
    en: './translation/en_us.js'
  }

  const filePath = langMap[selectedLang] || langMap['en']

  const langFile = require(filePath)

  return langFile
}

const useLanguage = ({ selectedLang = 'en' }) => {
  const lang = useSelector(selectedLang)

  const translate = (value) => {
    const text = getLabel(lang, value)

    // eg: sign_up -> Sign Up
    // const t = useLanguage({ selectedLang: 'vi' })

    // t('sign_up') // => "Đăng ký"
    // t('manage_your_company_with') // => "Quản lý công ty của bạn với"
    return text
  }

  return translate
}

export default useLanguage
