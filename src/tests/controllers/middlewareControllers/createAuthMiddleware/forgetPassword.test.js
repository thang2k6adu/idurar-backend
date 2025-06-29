// forgetPassword.test.js

import { forgetPassword } from '~/controllers/middlewareControllers/createAuthMiddleware/forgetPassword'
import mongoose from 'mongoose'
import { sendMail } from '~/controllers/middlewareControllers/createAuthMiddleware/sendMail'

// Mock dependencies
jest.mock('mongoose', () => ({ model: jest.fn() }))
jest.mock('shortid', () => ({ generate: jest.fn(() => 'mocked-token') }))
jest.mock('~/settings', () => ({
  useAppSettings: jest.fn(() => ({
    idurar_app_email: 'noreply@idurar.com',
    idurar_base_url: 'idurar.com',
  }))
}))
jest.mock('~/controllers/middlewareControllers/createAuthMiddleware/checkAndCorrectURL', () => ({
  checkAndCorrectURL: jest.fn(() => 'http://mocked-url.com'),
}))
jest.mock('~/controllers/middlewareControllers/createAuthMiddleware/sendMail', () => ({
  sendMail: jest.fn(),
}))

// Mocks
const mockFindOneExec = jest.fn()
const mockFindOneAndUpdateExec = jest.fn()

const mockUserModel = {
  findOne: jest.fn(() => ({ exec: mockFindOneExec })),
}
const mockPasswordModel = {
  findOneAndUpdate: jest.fn(() => ({ exec: mockFindOneAndUpdateExec })),
}

beforeEach(() => {
  jest.clearAllMocks()
  mongoose.model.mockImplementation((modelName) => {
    if (modelName === 'Admin') return mockUserModel
    if (modelName === 'AdminPassword') return mockPasswordModel
    if (modelName === 'User') return mockUserModel // fallback for some test
    if (modelName === 'UserPassword') return mockPasswordModel
    return null
  })
})

describe('forgetPassword', () => {
  const mockReq = { body: { email: 'test@example.com' } }
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }

  // Return 404 if user not found
  it('should return 404 if user not found', async () => {
    mockFindOneExec.mockResolvedValue(null)

    await forgetPassword(mockReq, mockRes, { userModel: 'Admin' })

    expect(mockRes.status).toHaveBeenCalledWith(404)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/no account/i),
      })
    )
  })

  // Return 500 if password record update failed
  it('should return 500 if password record update failed', async () => {
    const mockUser = { _id: 'user123', name: 'John Doe' }
    mockFindOneExec.mockResolvedValue(mockUser)
    mockFindOneAndUpdateExec.mockResolvedValue(null)

    await forgetPassword(mockReq, mockRes, { userModel: 'Admin' })

    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Failed to update password record',
      })
    )
  })

  // Return 200 and send email when successful
  it('should return 200 and send email when successful', async () => {
    const mockUser = { _id: 'user123', name: 'John Doe' }
    mockFindOneExec.mockResolvedValue(mockUser)
    mockFindOneAndUpdateExec.mockResolvedValue({
      user: mockUser._id,
      resetToken: 'mocked-token',
    })

    await forgetPassword(mockReq, mockRes, { userModel: 'Admin' })

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/check your email/i),
      })
    )

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        name: 'John Doe',
        link: expect.stringMatching(/resetpassword\/user123\/mocked-token/),
        idurar_app_email: 'noreply@idurar.com',
        type: 'passwordVerification',
      })
    )
  })

  // Return error if email is invalid
  it('should return error if email is invalid', async () => {
    const badReq = { body: { email: 'invalid-email' } }

    await forgetPassword(badReq, mockRes, { userModel: 'Admin' })

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errorMessage: expect.stringMatching(/email/i),
      })
    )
  })
})