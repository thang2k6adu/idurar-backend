import mongoose from 'mongoose'
export const logout = async (req, res, { userModel }) => {
  const UserPasswordModel = mongoose.model(userModel + 'Password')

  // const token = req.cookies['']

  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // Extract the token

  if (token) {
    // req.admin ở đây là được middleware xác thực gán vào
    await UserPasswordModel.findOneAndUpdate(
      { user: req.admin._id },
      { $pull: { loggedSessions: token } },
      { new: true }
    ).exec()
  } else {
    await UserPasswordModel.findOneAndUpdate(
      { user: req.admin._id },
      { $pull: { loggedSessions: [] } },
      { new: true }
    ).exec()
  }

  return res.json({
    success: true,
    result: null,
    message: 'Successfully logout',
  })
}
