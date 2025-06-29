import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { env } from '~/config/environment'
import { User } from '~/models/coreModels/Admin'
import { UserPassword } from '~/models/coreModels/AdminPassword'

export const isValidAuthToken = async (req, res, next) => {
  try {
    // get token from header
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'No authentication token, authorization denied.',
        jwtExpired: true,
      })
    }

    // Verify JWT token
    const verified = jwt.verify(token, env.JWT_SECRET)

    // find user by id
    // we need to check if the user is removed or not, despite the token is valid
    const user = await User.findOne({ _id: verified.id, removed: false })
    const userPassword = await UserPassword.findOne({
      user: verified.id,
      removed: false,
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'User does not exist, authorization denied',
        jwtExpired: true,
      })
    }

    // verify token in loggedSessions
    // To controle multiple login, we need to check if the token is in the loggedSessions array
    const { loggedSessions } = userPassword
    if (!loggedSessions.includes(token)) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'User is already logout, authorization denied',
        jwtExpired: true,
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Internal server error',
      jwtExpired: true,
    })
  }
}
