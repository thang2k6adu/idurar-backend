import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

export const updatePassword = async (userModel, req, res) => {
  const UserModel = mongoose.model(userModel)

  const { id } = req.params
  const { password } = req.body

  const reqUserModel = userModel.toLowerCase()
  const userProfile = req[reqUserModel]

  if ( userProfile.email === 'admin@demo.com') {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'You cannot change the password of the demo user',
    })
  }

  // if (userProfile._id !== id) {
  //   return res.status(403).json({
  //     success: false,
  //     result: null,
  //     message: 'You cannot change the password of another user',
  //   })
  // }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Password must be at least 8 characters long',
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const result = await UserModel.findOneAndUpdate({
    _id: id,
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
    result,
    message: 'Successfully updated the user password',
  })
}