import { createCRUDController } from '~/controllers/middlewareControllers/createCRUDController'
import { create } from './create'
import { summary } from './summary'
import { update } from './update'
import { sendMail } from './sendMail'
import { remove } from './remove'

const methods = createCRUDController('Payment')

methods.create = create
methods.summary = summary
methods.update = update
methods.sendMail = sendMail
methods.remove = remove

export default methods
