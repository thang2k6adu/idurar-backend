const pattern = './src/models/**/*.js'
import { globSync } from 'glob'
// basename (user.js), extname (.js)
import { basename, extname } from 'path'

// globSync ís a function that returns an array of files that match the pattern
const appModelsFiles = globSync('./src/models/appModels/**/*.js')
// [
//   './src/models/appModels/user.js',
//   './src/models/appModels/post.js',
//   './src/models/appModels/sub/comment.js'
// ]
// Return all model files in the models directory
// Example: ['user', 'product', 'order']
const modelFiles = globSync(pattern).map((filePath) => {
  const fileNameWithExtension = basename(filePath)
  const fileNameWithoutExtension = fileNameWithExtension.replace(
    extname(fileNameWithExtension),
    ''
  )
  return fileNameWithoutExtension
})

const controllersList = []
const appModelsList = []
const entityList = []
const routesList = []

for (const filePath of appModelsFiles) {
  const fileNameWithExtension = basename(filePath)
  const fileNameWithoutExtension = fileNameWithExtension.replace(
    extname(fileNameWithExtension),
    ''
  )
  const firstChar = fileNameWithoutExtension.charAt(0)
  const modelName = fileNameWithoutExtension.replace(
    firstChar,
    firstChar.toUpperCase()
  )
  const fileNameLowerCaseFirstChar = fileNameWithoutExtension.replace(
    firstChar,
    firstChar.toLowerCase()
  )
  const entity = fileNameWithoutExtension.toLowerCase()

  const controllerName = fileNameLowerCaseFirstChar + 'Controller'
  controllersList.push(controllerName)
  appModelsList.push(modelName)
  entityList.push(entity)

  const route = {
    entity,
    modelName,
    controllerName,
  }
  routesList.push(route)
}

export {
  modelFiles,
  controllersList,
  appModelsList,
  entityList,
  routesList,
}
