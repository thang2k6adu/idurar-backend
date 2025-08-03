import express from 'express'
import path from 'path'
import { isPathInside } from '~/utils/isPathInside'

const router = express.Router()

router.route(':/subPath/:directory/:file').get((req, res) => {
  try {
    // /download/Hồ%20Chí%20Minh%2FTư%20liệu%20năm%202025/Báo%20cáo%20tháng%208.pdf
    const { subPath, directory, file } = req.params

    // Decode each parameter separately
    const decodedSubPath = decodeURIComponent(subPath) //download
    const decodedDirectory = decodeURIComponent(directory) //Hồ Chí Minh/Tư liệu năm 2025
    const decodedFile = decodeURIComponent(file) //Báo cáo tháng 8.pdf

    // Define the root directory
    // ở file hiện tại, đi lên 2 cấp nữa (routes/src)
    const rootDir = path.join(__dirname, '../../public')

    // Safely join the decoded path
    const relativePath = path.join(decodedSubPath, decodedDirectory, decodedFile)
    const absolutePath = path.join(rootDir, relativePath)

    // check if the resulting path stays inside rootDir
    if (!isPathInside(absolutePath, rootDir)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file path',
      })
    }

    // used for opening a file directly on browser
    return res.sendFile(absolutePath, (error) => {
      if (error) {
        return res.status(404).json({
          success: false,
          result: null,
          message: 'Cannot find ' + file,
        })
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    })
  }
})
