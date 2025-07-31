import mongoose from 'mongoose'

export const read = async (userModel, req, res) => {
  const UserModel = mongoose.model(userModel)

  const { id } = req.params
  const tmpResult = await UserModel.findOne({
    _id: id,
    removed: false,
  }).exec()

  if (!tmpResult) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found',
    })
  } else {
    let result = {
      _id: tmpResult._id,
      enabled: tmpResult.enabled,
      email: tmpResult.email,
      name: tmpResult.name,
      surname: tmpResult.surname,
      photo: tmpResult.photo,
      role: tmpResult.role,
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'Successfully found the document',
    })
  }
}
