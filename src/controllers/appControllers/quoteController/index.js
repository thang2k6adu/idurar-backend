import { createCRUDController } from '~/controllers/middlewareControllers/createCRUDController'
import { sendMail } from './sendMail'
import { create } from './create'
import { summary } from './summary'
import { update } from './update'
import { convertQuoteToInvoice } from './convertQuoteToInvoice'
import { paginatedList } from './paginatedList'
import { read } from './read'

const methods = createCRUDController('Quote')
methods.sendMail = sendMail
methods.create = create
methods.summary = summary
methods.update = update
methods.convertQuoteToInvoice = convertQuoteToInvoice
methods.paginatedList = paginatedList
methods.read = read

export default methods
