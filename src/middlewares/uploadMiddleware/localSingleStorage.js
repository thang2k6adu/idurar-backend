import multer from 'multer'
import path from 'path'
import { slugify } from 'transliteration'
import { fileFilter } from './utils/multerFileFilter'

export const localSingleStorage = ({
  entity,
  fileType = 'default',
  uploadFieldName = 'file',
  fieldName = 'file',
}) => {
  var diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `src/public/uploads/${entity}`)
    },
    fileName: function (req, file, cb) {
      try {
        let fileExtension = path.extname(file.originalname)
        let uniqueFileID = Math.random().toString(36).slice(2, 7) // turn number into base 36 and delete 0. eg 0.r98jf -> r98jf

        let originalName = ''
        if (req.body.seotitle) {
          originalName = slugify(req.body.seotitle.toLocaleLowerCase())
        } else {
          originalName = slugify(
            file.originalName.split('.')[0].toLocaleLowerCase()
          )
        }

        let _fileName = `${originalName}-${uniqueFileID}${fileExtension}`

        const filePath = `public/uploads/${entity}/${_fileName}`

        req.upload = {
          fileName: _fileName,
          fileExt: fileExtension,
          entity,
          fieldName,
          fileType: fileType,
          filePath,
        }

        req.body[fieldName] = filePath

        cb(null, _fileName)
      } catch (error) {
        cb(error)
      }
    },
  })

  let filterType = fileFilter(fileType)
  const multerStorage = multer({
    storage: diskStorage,
    fileFilter: filterType,
  }).single('file')

  return multerStorage
}
