import { createCRUDController } from '~/controllers/middlewareControllers/createCRUDController'

const methods = createCRUDController('Setting')

const settingMethods = {
  ...methods,
}

export default settingMethods