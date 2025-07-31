import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

export const updateProfilePassword = async (userModel, req, res) => {
  const UserModel = mongoose.model(userModel)

  const { id } = req.params

  const reqUserModel = userModel.toLowerCase()
  const userProfile = req[reqUserModel]

  if (userProfile.email === 'admin@demo.com') {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Cannot update demo informations',
    })
  }

  let { password, passwordCheck } = req.body

  if (!password || !passwordCheck) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Password and password check are required',
    })
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Password must be at least 8 characters long',
    })
  }

  if (password !== passwordCheck) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Passwords do not match',
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const result = await UserModel.findOneAndUpdate({
    _id: userProfile._id,
    removed: false,
  }, {
    password: hashedPassword,
  }, {
    new: true,
  }).exec()

  if (!result) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'User Password could not be updated correctly',
    })
  }

  return res.status(200).json({
    success: true,
    result: {},
    message: 'Successfully updated the user password',
  })
}
