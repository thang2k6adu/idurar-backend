import mongoose from 'mongoose'

export const updateProfile = async (userModel, req, res) => {
  const UserModel = mongoose.model(userModel)

  const reqUserName = userModel.toLowerCase()
  const userProfile = req[reqUserName]

  if (userProfile.email === 'admin@demo.com') {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Cannot update demo informations',
    })
  }

  let updates = req.body.photo
    ? {
      email: req.body.email,
      name: req.body.name,
      surname: req.body.surname,
      photo: req.body.photo,
    }
    : {
      email: req.body.email,
      name: req.body.name,
      surname: req.body.surname,
    }
  const result = await UserModel.findOneAndUpdate({
    _id: userProfile._id,
    removed: false,
  }, updates, {
    new: true,
  }).exec()

  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'User Profile could not be found',
    })
  } else {
    return res.status(200).json({
      success: true,
      result: {
        _id: result?._id,
        enabled: result?.enabled,
        email: result?.email,
        name: result?.name,
        surname: result?.surname,
        photo: result?.photo,
        role: result?.role,
      },
      message: 'Successfully updated the user profile',
    })
  }
}
