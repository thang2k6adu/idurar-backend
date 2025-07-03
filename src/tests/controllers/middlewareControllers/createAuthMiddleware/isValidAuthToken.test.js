import { isValidAuthToken } from '~/controllers/middlewareControllers/createAuthMiddleware/isValidAuthToken'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

// Mock internal dependecies
jest.mock('jsonwebtoken')
jest.mock('mongoose', () => ({
  // jest.fn = jest function
  // mockReturnValue(value)
  // mockResolvedValue
  // mockImplementation
  // mockReturnValueOnce
  model: jest.fn(),
}))

// Group test cases (it)
// describe('Tên nhóm test', () => {
//   it('test cụ thể 1', () => { ... })
//   it('test cụ thể 2', () => { ... })
// })
describe('isValidAuthToken middleware (ESM)', () => {
  const userModel = 'Admin'
  const token = 'valid.jwt.token'
  let req, res, next

  // run before each test case
  // often used to setting req, res, next, env
  beforeEach(() => {
    req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    next = jest.fn()
    process.env.JWT_SECRET = 'TEST_SECRET'
  })

  // Không có token trong header thì trả 401
  it('should return 401 if token is missing', async () => {
    req.headers.authorization = null

    await isValidAuthToken(req, res, next, { userModel })

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'No authentication token, authorization denied.',
      })
    )
  })

  // Return 500 if jwt.verify throws error
  it('should return 500 if jwt.verify throws error', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Token expired')
    })

    await isValidAuthToken(req, res, next, { userModel })

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Token expired',
        controller: 'isValidAuthToken',
      })
    )
  })

  // Return 401 and message if user not found
  it('should return 401 if user not found', async () => {
    jwt.verify.mockReturnValue({ id: '123' })

    const User = { findOne: jest.fn().mockResolvedValue(null) }
    const UserPassword = { findOne: jest.fn().mockResolvedValue({ loggedSessions: [token] }) }

    mongoose.model.mockImplementation((modelName) => {
      if (modelName === 'Admin') return User
      if (modelName === 'AdminPassword') return UserPassword
    })

    await isValidAuthToken(req, res, next, { userModel })

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User does not exist, authorization denied.',
      })
    )
  })

  // Return 401 if token not in loggedSessions
  it('should return 401 if token not in loggedSessions', async () => {
    jwt.verify.mockReturnValue({ id: '123' })

    const User = { findOne: jest.fn().mockResolvedValue({}) }
    const UserPassword = { findOne: jest.fn().mockResolvedValue({ loggedSessions: ['wrong.token'] }) }

    mongoose.model.mockImplementation((modelName) => {
      if (modelName === 'Admin') return User
      if (modelName === 'AdminPassword') return UserPassword
    })

    await isValidAuthToken(req, res, next, { userModel })

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('User is already logout'),
      })
    )
  })

  // Call next() and attach user to req if token is valid
  it('should call next() and attach user if token is valid', async () => {
    jwt.verify.mockReturnValue({ id: '123' })

    const mockUser = { _id: '123', name: 'Admin' }
    const mockPassword = { loggedSessions: [token] }

    const User = { findOne: jest.fn().mockResolvedValue(mockUser) }
    const UserPassword = { findOne: jest.fn().mockResolvedValue(mockPassword) }

    mongoose.model.mockImplementation((modelName) => {
      if (modelName === 'Admin') return User
      if (modelName === 'AdminPassword') return UserPassword
    })

    await isValidAuthToken(req, res, next, { userModel })

    expect(req[userModel.toLowerCase()]).toBe(mockUser)
    expect(next).toHaveBeenCalled()
  })
})
