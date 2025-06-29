import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import Joi from 'joi'
import mongoose from 'mongoose'
import shortid from 'shortid'

export const resetPassword = async (req, res, { userModel }) => {
  const UserModel = mongoose.model(userModel)
  const UserPasswordModel = mongoose.model(userModel + 'Password')
  const { password, userId, resetToken } = req.body

  // Validate
  const objectSchema = Joi.object({
    password: Joi.string().required(),
    userId: Joi.string().required(),
    resetToken: Joi.string().required(),
  })

  const { error, value } = objectSchema.validate({
    password,
    userId,
    resetToken,
  })
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid reset password object',
      errorMessage: error.message,
    })
  }

  const databasePassword = await UserPasswordModel.findOne({
    user: userId,
    removed: false,
  })
  const user = await UserModel.findOne({ _id: userId, removed: false })

  if (!user || !databasePassword) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registerd.',
    })
  }

  if (!user.enabled) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Your account is disabled, contact your account administrator.',
    })
  }

  const isMatch = resetToken == databasePassword.resetToken
  if (
    !isMatch ||
    databasePassword.resetToken === undefined ||
    databasePassword.resetToken === null
  ) {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Invalid reset token.',
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const emailToken = shortid.generate()
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  })

  // ResetPassword is quite similar to VerifyEmail
  await UserPasswordModel.findOneAndUpdate(
    { user: userId },
    {
      $push: { loggedSessions: token },
      password: hashedPassword,
      emailToken: emailToken,
      resetToken: shortid.generate(),
      emailVerified: true,
    },
    {
      new: true,
    }
  )

  return res.status(200).json({
    success: true,
    result: {
      _id: user._id,
      name: user.name,
      surname: user.surname,
      role: user.role,
      email: user.email,
      photo: user.photo,
      token: token,
      maxAge: req.body.remember ? 365 : null,
    },
    message: ' Successfully reset password',
  })
}
