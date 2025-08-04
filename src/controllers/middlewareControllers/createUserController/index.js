import { read } from './read'
import { updateProfile } from './updateProfile'
import { updatePassword } from './updatePassword'
import { updateProfilePassword } from './updateProfilePassword'

export const createUserController = (userModel) => {
  let userController = {}

  userController.read = (req, res) => read(userModel, req, res)
  userController.updateProfile = (req, res) => updateProfile(userModel, req, res)
  userController.updatePassword = (req, res) => updatePassword(userModel, req, res)
  userController.updateProfilePassword = (req, res) => updateProfilePassword(userModel, req, res)

  return userController
}
