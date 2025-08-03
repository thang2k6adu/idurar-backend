import pug from 'pug'
import fs from 'fs'
import moment from 'moment'
import pdf from 'html-pdf'
import { listAllSettings, loadSettings } from '~/middlewares/settings'
import useLanguage from '~/locale/useLanguage'
import { useMoney, useDate } from '~/settings'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

const pugFiles = ['invoice', 'offer', 'quote', 'payment']

export const generatePdf = (
  modelName,
  info = { fileName: 'pdf_file', format: 'A5', targetLocation: '' },
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
      const settings = loadSettings()
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

      const folder = path.dirname(targetLocation) //extract just the folder path (remove filename)
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true })
      }

      // Modern asynchronous functions return Promises and can be used with 'await'.
      // Older Node.js-style APIs (like res.download or pdf.create().toFile) use callbacks instead,
      // which means 'await' won't work unless you manually wrap them in a Promise.
      // Always wrap callback-based functions if you want to use async/await consistently.
      return new Promise((resolve, reject) => {
        pdf
          .create(htmlContent, {
            format: info.format,
            orientation: 'portrait',
            border: '10mm',
          })
          .toFile(targetLocation, function (error, res) {
            if (error) return reject(error)
            resolve(res) // res includes info like filename, path, etc.
          })
      })
    } else {
      throw new Error(`No pug template found for model: ${modelName}`)
    }
  } catch (error) {
    throw new Error(error)
  }
}
