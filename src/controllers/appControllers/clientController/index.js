import mongoose from 'mongoose'
import { createCRUDController } from '~/controllers/middlewareControllers/createCRUDController'
import { summary } from './summary'

const modelController = () => {
  const Model = mongoose.model('Client')
  const methods = createCRUDController('Client')

  methods.summary = (req, res) => summary(Model, req, res)

  return methods
}

export const clientController = modelController()