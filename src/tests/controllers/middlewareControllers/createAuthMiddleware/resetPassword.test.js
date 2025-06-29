import { resetPassword } from '~/controllers/middlewareControllers/createAuthMiddleware/resetPassword'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import shortid from 'shortid'

// Mocks
jest.mock('mongoose', () => ({ model: jest.fn() }))
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'mocked-jwt-token') }))
jest.mock('bcrypt', () => ({ hash: jest.fn(() => 'hashed-password') }))
jest.mock('shortid', () => ({ generate: jest.fn(() => 'mocked-token') }))

const mockFindOneUser = jest.fn()
const mockFindOnePassword = jest.fn()
const mockFindOneAndUpdate = jest.fn()

const mockUserModel = {
  findOne: mockFindOneUser
}
const mockUserPasswordModel = {
  findOne: mockFindOnePassword,
  findOneAndUpdate: mockFindOneAndUpdate
}

beforeEach(() => {
  jest.clearAllMocks()

  mongoose.model.mockImplementation((modelName) => {
    if (modelName === 'Admin') return mockUserModel
    if (modelName === 'AdminPassword') return mockUserPasswordModel
    return null
  })
})

describe('resetPassword', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  }

  const validBody = {
    password: 'new-password',
    userId: 'user123',
    resetToken: 'mocked-token'
  }

  // Return 409 if body is invalid
  it('should return 409 if body is invalid', async () => {
    const req = { body: { password: 'abc' } }

    await resetPassword(req, mockRes, { userModel: 'Admin' })

    expect(mockRes.status).toHaveBeenCalledWith(409)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      errorMessage: expect.stringMatching(/required/)
    }))
  })

  // Return 404 if user or password not found
  it('should return 404 if user or password not found', async () => {
    mockFindOneUser.mockResolvedValue(null)
    mockFindOnePassword.mockResolvedValue(null)

    const req = { body: validBody }

    await resetPassword(req, mockRes, { userModel: 'Admin' })

    expect(mockRes.status).toHaveBeenCalledWith(404)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/no account/i)
    }))
  })

  // Return 409 if user is disabled
  it('should return 409 if user is disabled', async () => {
    mockFindOneUser.mockResolvedValue({ _id: 'user123', enabled: false })
    mockFindOnePassword.mockResolvedValue({ resetToken: 'mocked-token' })

    const req = { body: validBody }

    await resetPassword(req, mockRes, { userModel: 'Admin' })

    expect(mockRes.status).toHaveBeenCalledWith(409)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/disabled/i)
    }))
  })

  // Return 403 if reset token is invalid
  it('should return 403 if reset token is invalid', async () => {
    mockFindOneUser.mockResolvedValue({ _id: 'user123', enabled: true })
    mockFindOnePassword.mockResolvedValue({ resetToken: 'wrong-token' })

    const req = { body: validBody }

    await resetPassword(req, mockRes, { userModel: 'Admin' })

    expect(mockRes.status).toHaveBeenCalledWith(403)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid reset token.'
    }))
  })

  // Return 200 and reset password successfully
  it('should return 200 and reset password successfully', async () => {
    const mockUser = {
      _id: 'user123',
      name: 'John',
      surname: 'Doe',
      role: 'admin',
      email: 'john@example.com',
      photo: 'photo.png',
      enabled: true
    }

    const mockPassword = {
      resetToken: 'mocked-token'
    }

    mockFindOneUser.mockResolvedValue(mockUser)
    mockFindOnePassword.mockResolvedValue(mockPassword)
    mockFindOneAndUpdate.mockResolvedValue({}) // không cần dữ liệu trả lại

    const req = { body: { ...validBody, remember: true } }

    await resetPassword(req, mockRes, { userModel: 'Admin' })

    expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 10)
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user123' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    expect(mockFindOneAndUpdate).toHaveBeenCalled()

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      result: expect.objectContaining({
        _id: 'user123',
        token: 'mocked-jwt-token',
        maxAge: 365
      })
    }))
  })
})
