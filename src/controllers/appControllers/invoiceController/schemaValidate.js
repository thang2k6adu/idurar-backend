import Joi from 'joi'
export const schema = Joi.object({
  client: Joi.alternatives().try(Joi.string().trim(), Joi.object()).required(),
  number: Joi.number().required(),
  year: Joi.number().required(),
  status: Joi.string().trim().required(),
  notes: Joi.string().trim().allow(''),
  date: Joi.date().required(),
  items: Joi.array().items(
    Joi.object({
      // Create doesnot need _id, FE can send with '' or not
      _id: Joi.string().allow('').optional(),
      itemName: Joi.string().trim().required(),
      description: Joi.string().trim().allow(''),
      quantity: Joi.number().required(),
      price: Joi.number().required(),
      total: Joi.number().required(),
    })
  ).required(),
  taxRate: Joi.alternatives().try(Joi.number(), Joi.string().trim()).required(),
})