import Joi from 'joi'
import mongoose from 'mongoose'
import { authUser } from './authUser'

export const login = async (req, res, { userModel }) => {
  const UserPasswordModel = mongoose.model(userModel + 'Password')
  const UserModel = mongoose.model(userModel)

  const { email, password } = req.body

  // Validate
  const objectSchema = Joi.object({
    // kiểm tra cả top-level domain như .com .vn .org
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().required(),
  })

  const { error } = objectSchema.validate({ email, password })
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Invalid/Missing credentials',
      error: error,
      errorMessage: error.message,
    })
  }

  const user = await UserModel.findOne({ email: email, removed: false })

  if (!user) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registered',
    })
  }

  if (!user.enabled) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Your account is disabled, contact your account administrator',
    })
  }

  const databasePassword = await UserPasswordModel.findOne({
    user: user._id,
    removed: false,
  })

  // auth user if has correct password
  authUser(req, res, {
    user,
    databasePassword,
    password,
    UserPasswordModel,
  })
}
