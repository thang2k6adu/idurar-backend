const pattern = './src/models/**/*.js'

// Return all model files in the models directory
// Example: ['user', 'product', 'order']
export const modelFiles = globSync(pattern).map((filePath) => {
  const fileNameWithExtension = basename(filePath)
  const fileNameWithoutExtension = fileNameWithExtension.replace(
    extname(fileNameWithExtension),
    ''
  )
  return fileNameWithoutExtension
})
