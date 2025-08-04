import mongoose from 'mongoose'
import { generatePdf } from '~/controllers/pdfController'
import path from 'path'

export const downloadPdf = async (req, res, { directory, id }) => {
  try {
    const allowedDirectories = ['invoice', 'offer', 'quote', 'payment']
    if (!allowedDirectories.includes(directory.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid directory' })
    }

    const modelName = directory.slice(0, 1).toUpperCase() + directory.slice(1)
    let result = null

    // Mongoose keeps track of all model that have been registered
    if (mongoose.models[modelName]) {
      const Model = mongoose.model(modelName)
      result = await Model.findOne({
        _id: id,
      }).exec()
    }

    if (!result) {
      const error = new Error('Validation failed')
      error.name = 'ValidationError'
      throw error
    }

    const fileId = modelName.toLowerCase() + '-' + result._id + '.pdf'
    const folderPath = modelName.toLowerCase()
    const targetLocation = path.join('src/public/download', folderPath, fileId)

    await generatePdf(
      modelName,
      {
        fileName: folderPath,
        format: 'A4',
        targetLocation,
      },
      result
      // () => {
      //   // res.download(path, [filename], [options], [callback])
      //   return res.download(targetLocation, (error) => {
      //     if (error)
      //       return res.status(500).json({
      //         success: false,
      //         result: null,
      //         message: 'Faild to download the requested file',
      //         error: error.message,
      //       })
      //   })
      // }
    )

    return res.download(targetLocation, (error) => {
      if (error) {
        console.error('Download error:', error)
        // Check if response headers have already been sent to the client.
        // If headers were sent, it means the response has started.
        // Sending another response (like res.json or res.status again) after that
        // would result in an error: "Can't set headers after they are sent."
        // Always use res.headersSent to avoid sending multiple responses for one request.
        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            result: null,
            message: 'Fail to download PDF',
            error: error.message,
          })
        }
      }
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Required fields are not supplied',
      })
      // BSONTypeError is usually thrown wwhen you pass an invalid ID to MongoDB Function
    } else if (error.name === 'BSONTypeError') {
      return res.status(400).json({
        success: false,
        result: null,
        error: error.message,
        message: 'Invalid ID',
      })
    } else {
      return res.status(500).json({
        success: false,
        result: null,
        message: error.message,
        error: error.message,
        controller: 'downloadPdf.js',
      })
    }
  }
}
