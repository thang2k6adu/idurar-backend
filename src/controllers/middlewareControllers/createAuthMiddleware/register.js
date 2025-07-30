import Joi from 'joi'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

export const register = async (req, res, { userModel }) => {
  const UserModel = mongoose.model(userModel)
  const UserPasswordModel = mongoose.model(userModel + 'Password')
  const { email, password, name, surname } = req.body

  // validate
  const objectSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: true } }).required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    surname: Joi.string().optional(),
  })

  const { error } = objectSchema.validate({ email, password, name, surname })
  if (error) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Invalid input data',
      error: error.details[0].message,
    })
  }

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: email.toLowerCase(), removed: false })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        result: null,
        message: 'User with this email already exists',
      })
    }

    // Create new user
    const newUser = new UserModel({
      email: email.toLowerCase(),
      name,
      surname: surname || '',
      enabled: true,
      removed: false,
    })

    const savedUser = await newUser.save()

    // Hash password and create user password record
    const hashedPassword = await bcrypt.hash(password, 10)
    const userPassword = new UserPasswordModel({
      user: savedUser._id,
      password: hashedPassword,
      emailVerified: false,
      removed: false,
    })

    await userPassword.save()

    return res.status(201).json({
      success: true,
      result: {
        _id: savedUser._id,
        email: savedUser.email,
        name: savedUser.name,
        surname: savedUser.surname,
      },
      message: 'User registered successfully',
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Internal server error during registration',
    })
  }
}