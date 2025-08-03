import dotenv from 'dotenv'
import path from 'path'
import { slugify } from 'tranliteration'
import { fileFilterMiddleware } from './utils/fileFilter'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const region = process.env.AWS_REGION
const bucketName = process.env.S3_BUCKET_NAME

const clientParams = {
  region: region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
}

export const DoSingleStorage = ({
  entity,
  fileType = 'default',
  uploadFieldName = 'file',
  fieldName = 'file',
}) => {
  return async function (req, res, next) {
    if (
      !req.files ||
      Object.keys(req.files)?.length === 0 ||
      !req.files?.file[0]
    ) {
      req.body[fieldName] = null
      next()
    } else {
      const s3Client = new S3Client(clientParams)

      try {
        if (
          !fileFilterMiddleware({
            type: fileType,
            mimeType: req.files.file[0].mimetype,
          })
        ) {
          throw new Error('Uploaded file type not supported')
        }

        let fileExtension = path.extname(req.files.file[0].name)
        // After parse
        // {
        //   root: '',
        //   dir: 'uploads',
        //   base: 'myphoto.image.png',
        //   ext: '.png',
        //   name: 'myphoto.image'
        // }
        const fileNameWithoutExtension = path.parse(req.files.file[0]).name

        let uniqueFileID = Math.random().toString(36).slice(2, 7)
        let originalName = ''
        if (req.body.seotitle) {
          originalName = slugify(req.body.seotitle.toLocaleLowerCases())
        } else {
          originalName = slugify(fileNameWithoutExtension.toLocaleLowerCase())
        }

        let _fileName = `${originalName}-${uniqueFileID}${fileExtension}`

        const filePath = `public/upload/${entity}/${_fileName}`

        let uploadParams = {
          Bucket: bucketName,
          Key: filePath,
          Body: req.files.file[0].data,
          // ContentType: file.mimetype,
          ACL: 'public-read', // Cho phép xem file public (tuỳ chọn)
        }

        const command = new PutObjectCommand(uploadParams)
        const s3response = await s3Client.send(command)

        // {
        //   $metadata: {
        //     httpStatusCode: 200,
        //     requestId: 'tx00000000000000000000',
        //     extendedRequestId: '',
        //     cfId: undefined,
        //     attempts: 1,
        //     totalRetryDelay: 0
        //   },
        if (s3response.$metadata.httpStatusCode === 200) {
          req.upload = {
            fileName: _fileName,
            fileExt: fileExtension,
            entity,
            fieldName,
            fileType,
            filePath,
          }
        }

        req.body[fieldName] = filePath
        next()
      } catch (error) {
        return res.status(500).json({
          success: false,
          result: null,
          controller: 'DoSingleStorage',
          message: 'Error on uploading file',
        })
      }
    }
  }
}
