// create new document
export const create = async(Model, req, res) => {
  // Creating a new document in the collection
  req.body.removed = false
  const result = await new Model({
    ...req.body
  }).save()

  return res.status(200).json({
    success: true,
    result,
    message: 'Successfully created the document in model'
  })
}