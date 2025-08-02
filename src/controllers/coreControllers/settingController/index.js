import { createCRUDController } from '~/controllers/middlewareControllers/createCRUDController'
import { listAll } from './listAll'
import { listBySettingKey } from './listBySettingKey'
import { readBySettingKey } from './readBySettingKey'
import { updateBySettingKey } from './updateBySettingKey'
import { updateManySetting } from './updateManySetting'

const methods = createCRUDController('Setting')

const settingMethods = {
  read: methods.read,
  create: methods.create,
  update: methods.update,
  list: methods.list,
  filter: methods.filter,
  search: methods.search,
  listAll: listAll,
  listBySettingKey,
  readBySettingKey,
  updateBySettingKey,
  updateManySetting,
}

export default settingMethods