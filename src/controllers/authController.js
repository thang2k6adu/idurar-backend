import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { verifyPassword } from '~/utils/password'
import Joi from 'joi'
import { hashPassword } from '~/utils/password'
import { User } from '~/models/coreModels/Admin'
import { UserPassword } from '~/models/coreModels/AdminPassword'

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    console.log(email, password)

    // find user

    const user = await User.findOne({ email, removed: false })
    if (!user) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No account with this email has been registered',
      })
    }

    const userPassword = await UserPassword.findOne({
      user: user._id,
      removed: false,
    })

    // Verify password with salt
    const isMatch = verifyPassword(password, userPassword.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'Invalid credentials',
      })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: req.body.remember ? '365d' : '24h',
    })

    // save token to loggedSessions
    await UserPassword.findOneAndUpdate(
      { user: user._id },
      { $push: { loggedSessions: token } },
      { new: true }
    )

    res.status(200).json({
      success: true,
      result: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: token,
      },
      message: 'Successfully logged in',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    })
  }
}

const register = async (req, res) => {
  try {
    const { name, email, password, country } = req.body

    // Validation schema
    const objectSchema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string()
        .email({ tlds: { allow: true } })
        .required(),
      password: Joi.string().min(8).required(),
      country: Joi.string().required(),
    })

    const { error, value } = objectSchema.validate({
      name,
      email,
      password,
      country,
    })

    if (error) {
      return res.status(409).json({
        success: false,
        result: null,
        error: error,
        message: 'Invalid/Missing credentials',
        errorMessage: error.message,
      })
    }

    // Check existing email
    const existingUser = await User.findOne({ email, removed: false })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        result: null,
        message: 'An account with this emai already exists',
      })
    }

    // Hash password with salt
    const { passwordHash } = hashPassword(password)

    // Create new user
    const newUser = new User({
      name,
      email,
      country,
      enabled: true,
      removed: false,
    })

    const savedUser = await newUser.save()

    // Create password record
    const userPasswordData = {
      user: savedUser._id,
      password: passwordHash,
      loggedSessions: [],
      emailVerified: false,
      removed: false,
    }


    await new UserPassword(userPasswordData).save()

    return res.status(200).json({
      success: true,
      result: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        country: savedUser.country,
      },
      message: 'Account created successfully. Please verify your email',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    })
  }
}

export const authController = {
  login,
  register,
}
