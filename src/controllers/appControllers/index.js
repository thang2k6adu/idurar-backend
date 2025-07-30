import { createCRUDController } from '~/controllers/middlewareControllers/createCRUDController'
import { routesList } from '~/models/utils'
import { globSync } from 'glob'
import path from 'path'

// match any folder at any depth
const pattern = './src/models/appControllers/*/**/'
const controllerDirectories = globSync(pattern).map((filePath) => {
  // remove the src/models/appControllers/ from the path
  return path.basename(filePath)
})

const appControllers = () => {
  const controllers = []
  const hasCustomControllers = []

  controllerDirectories.forEach((controllerName) => {
    try {
      const customController = require(
        '~/controllers/appControllers/' + controllerName
      )

      console.log(customController)

      if (customController) {
        hasCustomControllers.push(customController)
        controllers[controllerName] = customController
      }
    } catch (error) {
      throw new Error(error.message)
    }
  })

  routesList.forEach(({ modelName, controllerName }) => {
    if (!hasCustomControllers.includes(controllerName)) {
      console.log(modelName)
      controllers[controllerName] = createCRUDController(modelName)
    }
  })

  return controllers
}

export default appControllers()
