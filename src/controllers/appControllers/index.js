import { createCRUDController } from '~/controllers/middlewareControllers/createCRUDController'
import { routesList } from '~/models/utils'
import { globSync } from 'glob'
import path from 'path'

// match any folder at any depth
const pattern = './src/controllers/appControllers/*/'
const controllerDirectories = globSync(pattern).map((filePath) => {
  // remove the src/controllers/appControllers/ from the path
  return path.basename(filePath)
})

const appControllers = () => {
  const controllers = []
  const hasCustomControllers = []

  // get custom controllers
  controllerDirectories.forEach((controllerName) => {
    try {
      const customController = require(
        path.resolve(
          process.cwd(),
          'src/controllers/appControllers/',
          controllerName
        )
      )

      if (customController) {
        hasCustomControllers.push(customController)
        controllers[controllerName] = customController
      }
    } catch (error) {
      throw new Error(error.message)
    }
  })

  // get default controllers
  routesList.forEach(({ modelName, controllerName }) => {
    if (!hasCustomControllers.includes(controllerName)) {
      controllers[controllerName] = createCRUDController(modelName)
    }
  })

  return controllers
}

export default appControllers()
