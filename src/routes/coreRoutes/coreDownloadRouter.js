import { downloadPdf } from '~/handlers/downloadHandler/downloadPdf'
import express from 'express'

const router = express.Router()

router.route('/:directory/:file').get((req, res) => {
  try {
    // directory in this case is model name: eg: invoice, quote
    // id in this case is id of model above
    // File is filename
    const { directory, file } = req.params
    const id = file.slice(directory.length + 1).slice(0, -4) //extract id from file name

    downloadPdf(req, res, { directory, id })
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    })
  }
})

export default router