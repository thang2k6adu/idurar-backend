import { createCRUDController } from '~/controllers/middlewareControllers/createCRUDController'
import { create } from './create'
import { paginatedList } from './paginatedList'
import { read } from './read'
import { remove } from './remove'
import { sendMail } from './sendMail'
import { summary } from './summary'
import { update } from './update'

const methods = createCRUDController('Invoice')

methods.create = create
methods.paginatedList = paginatedList
methods.read = read
methods.remove = remove
methods.sendMail = sendMail
methods.summary = summary
methods.update = update

export default methods