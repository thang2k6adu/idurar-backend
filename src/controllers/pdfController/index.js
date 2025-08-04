import pug from 'pug'
import fs from 'fs'
import moment from 'moment'
import puppeteer from 'puppeteer'
import { listAllSettings, loadSettings } from '~/middlewares/settings'
import useLanguage from '~/locale/useLanguage'
import { useMoney, useDate } from '~/settings'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

const pugFiles = ['invoice', 'offer', 'quote', 'payment']

export const generatePdf = async (
  modelName,
  info = { fileName: 'pdf_file', format: 'A5', targetLocation: '' },
  data,
  callback
) => {
  try {
    const { targetLocation, format = 'A5' } = info

    if (fs.existsSync(targetLocation)) {
      fs.unlinkSync(targetLocation)
    }

    if (!pugFiles.includes(modelName.toLowerCase())) {
      throw new Error(`No pug template found for model: ${modelName}`)
    }

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

    const { dateFormat } = useDate({ settings })

    settings.public_server_file = process.env.PUBLIC_SERVER_FILE

    // Tạo HTML từ Pug template
    const htmlContent = pug.renderFile(`src/pdf/${modelName}.pug`, {
      model: data,
      settings,
      translate,
      dateFormat,
      moneyFormatter,
      moment,
    })

    const folder = path.dirname(targetLocation)
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }

    // Puppeteer: generate PDF từ HTML
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // thường cần khi chạy trong Docker hoặc server Linux
    })
    const page = await browser.newPage()

    // Load nội dung HTML
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    })

    // Ghi ra file PDF
    await page.pdf({
      path: targetLocation,
      format,
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    })

    await browser.close()

    return {
      success: true,
      path: targetLocation,
    }
  } catch (error) {
    throw new Error(error)
  }
}
