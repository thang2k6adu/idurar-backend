//  find document with regex pattern based on different fields
// escape special characters in regex, avoid regex injection
const escapeRegex = (string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const search = async (Model, req, res) => {
  // console.log(req.query.fields)
  // if (req.query.q === undefined || req.query.q.trim() === '') {
  //   return res
  //     .status(202)
  //     .json({
  //       success: false,
  //       result: [],
  //       message: 'No document found by this request',
  //     })
  //     .end();
  // }
  // get fields from request
  // /search?q=thang&fields=name,email
  const fieldsArray = req.query.fields ? req.query.fields.split(',') : ['name']

  const fields = { $or: [] }

  // {
  //   $or: [
  //     { name: { $regex: /thang/i } },
  //     { email: { $regex: /thang/i } }
  //   ]
  // }
  // i: case insensitive (thang, Thang, THANG)
  for (const field of fieldsArray) {
    fields.$or.push({
      [field]: { $regex: new RegExp(escapeRegex(req.query.q), 'i') },
    })
  }

  let results = await Model.find({
    ...fields,
  })
    .where('removed', false)
    .limit(20)
    .exec()

  if (results.length >= 1) {
    return res.status(200).json({
      success: true,
      result: results,
      message: 'Successfully found all documents',
    })
  } else {
    return res.status(200).json({
      success: false,
      result: [],
      message: 'No documents found by this request',
    })
  }
}
