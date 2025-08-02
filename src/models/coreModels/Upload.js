import mongoose from 'mongoose'

const UploadSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  modelName: {
    type: String,
    trim: true,
  },
  fileId: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: [
      'jpeg',
      'jpg',
      'png',
      'gif',
      'webp',
      'doc',
      'txt',
      'csv',
      'docx',
      'xls',
      'xlsx',
      'pdf',
      'zip',
      'rar',
      'mp4',
      'mov',
      'avi',
      'mp3',
      'm4a',
      'webm',
    ],
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  userID: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  isSecure: {
    type: Boolean,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
})

export const Upload = mongoose.model('Upload', UploadSchema)
