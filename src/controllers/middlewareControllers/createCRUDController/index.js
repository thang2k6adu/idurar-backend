import mongoose from 'mongoose'
import {modelFiles} from '~/models/utils'

import { create } from './create'
import { filter } from './filter'
import { listAll } from './listAll'
import { paginatedList } from './paginatedList'
import { read } from './read'
import { remove } from './remove'
import { search } from './search'
import { summary } from './summary'
import { update } from './update'

export const createCRUDController = (modelName) => {
  if (!modelFiles.includes(modelName)) {
    throw new Error(`Model ${modelName} does not exist`)
  }

  const Model = mongoose.model(modelName)
  let crudMehods = {
    create: (req, res) => create(Model, req, res),
    filter: (req, res) => filter(Model, req, res),
    listAll: (req, res) => listAll(Model, req, res),
    paginatedList: (req, res) => paginatedList(Model, req, res),
    read: (req, res) => read(Model, req, res),
    remove: (req, res) => remove(Model, req, res),
    search: (req, res) => search(Model, req, res),
    summary: (req, res) => summary(Model, req, res),
    update: (req, res) => update(Model, req, res),
  }

  return crudMehods
}