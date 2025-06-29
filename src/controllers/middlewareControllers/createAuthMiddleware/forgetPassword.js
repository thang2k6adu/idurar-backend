import Joi from 'joi'
import mongoose from 'mongoose'
import { checkAndCorrectURL } from './checkAndCorrectURL'
import { sendMail } from './sendMail'
import shortid from 'shortid'
import { AdminPassword } from '~/models/coreModels/AdminPassword'
import { Admin } from '~/models/coreModels/Admin'

// import { loadSettings } from '~/middlewares/settings'

import { useAppSettings } from '~/settings'

export const forgetPassword = async (req, res, { userModel }) => {
  const UserPasswordModel = mongoose.model(userModel + 'Password')
  const UserModel = mongoose.model(userModel)
  const { email } = req.body

  // validate
  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
  })

  const { error, value } = objectSchema.validate({ email })
  if (error) {
    return res.status(400).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid email.',
      errorMessage: error.message,
    })
  }

  const user = await UserModel.findOne({ email: email, removed: false }).exec()

  if (!user) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registerd',
    })
  }

  const resetToken = shortid.generate()
  const passwordRecord = await UserPasswordModel.findOneAndUpdate(
    { user: user._id },
    { $set: { resetToken: resetToken } },
    { new: true }
  ).exec()

  if (!passwordRecord) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Failed to update password record',
    })
  }

  const settings = useAppSettings()
  const idurar_app_mail = settings.idurar_app_mail
  const idurar_base_url = settings.idurar_base_url

  const url = checkAndCorrectURL(idurar_base_url)
  const link = url + `/resetpassword/${user._id}/${resetToken}`

  await sendMail({
    email,
    name: user.name,
    link,
    subject: 'Reset your password | IDURAR',
    idurar_app_mail,
    type: 'passwordVerification',
  })

  return res.status(200).json({
    success: true,
    result: null,
    message: 'Check your email inbox to continue reset your password'
  })
}
