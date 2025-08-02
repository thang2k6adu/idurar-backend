import pug from 'pug'
import fs from 'fs'
import moment from 'moment'
import pdf from 'html-pdf'
import { listAllSettings, loadSettings } from '~/middlewares/settings'
import useLanguage from '~/locale/useLanguage'
import { useMoney, useDate } from '~/settings'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

const pugFiles = ['invoice', 'offer', 'quote', 'payment']

export const generatePdf = async (
  modelName,
  info = { filename: 'pdf_file', format: 'A5', targetLocation: '' },
  data,
  callback
) => {
  try {
    const { targetLocation } = info

    // If pdf already exist, delete it and create a new PDF
    if (fs.existsSync(targetLocation)) {
      fs.unlinkSync(targetLocation)
    }

    if (pugFiles.includes(modelName.toLowerCase())) {
      const settings = await loadSettings()
      const selectedLang = settings['idurar_app_language']
      const translate = useLanguage({ selectedLang })

      const {
        currency_symbol,
        currency_position,
        decimal_sep,
        thousand_sep,
        cent_precision,
        zero_format,
      } = settings

      // moneyFormatter (amount) => 10000 $ eg
      const { moneyFormatter } = useMoney({
        settings: {
          currency_symbol,
          currency_position,
          decimal_sep,
          thousand_sep,
          cent_precision,
          zero_format,
        },
      })
      // return dateFormat eg: DD/MM/YYYY
      const { dateFormat } = useDate({ settings })

      settings.public_server_file = process.env.PUBLIC_SERVER_FILE

      // const html = pug.renderFile(filepath, locals)
      // locals is an object containing variables you want to use inside the Pug template
      const htmlContent = pug.renderFile('src/pdf/' + modelName + '.pug', {
        model: data,
        settings,
        translate,
        dateFormat,
        moneyFormatter,
        moment,
      })

      pdf
        .create(htmlContent, {
          format: info.format,
          orientation: 'portrait',
          border: '10mm',
        })
        .toFile(targetLocation, function (error) {
          if (error) throw new Error(error)
          if (callback) callback()
        })
    }
  } catch (error) {
    throw new Error(error)
  }
}
