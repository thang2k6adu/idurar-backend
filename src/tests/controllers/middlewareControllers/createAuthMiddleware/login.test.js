import { login } from '~/controllers/middlewareControllers/createAuthMiddleware/login'
import { authUser } from '~/controllers/middlewareControllers/createAuthMiddleware/authUser'
import mongoose from 'mongoose'

jest.mock('mongoose', () => ({
  model: jest.fn(),
}))

// mock only work with module path
jest.mock('~/controllers/middlewareControllers/createAuthMiddleware/authUser', () => ({
  authUser: jest.fn(),
}))

describe('login', () => {
  const mockFindOneAdmin = jest.fn()
  const mockFindOneAdminPassword = jest.fn()

  const mockUser = {
    _id: '123',
    email: 'test@test.com',
    enabled: true,
  }

  const mockPassword = {
    password: 'hashedPassword',
  }

  const req = {
    body: {
      email: 'test@test.com',
      password: '123456',
    },
  }

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // simulate mongoose model
    mongoose.model.mockImplementation((modelName) => {
      if (modelName == 'Admin') {
        return { findOne: mockFindOneAdmin }
      }
      if (modelName == 'AdminPassword') {
        return { findOne: mockFindOneAdminPassword }
      }
    })
  })

  it('should return error if email or password is missing', async () => {
    const badReq = { body: { email: '', password: '' } }

    await login(badReq, res, { userModel: 'Admin' })

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid/Missing credentials',
      })
    )
  })

  it('should return error if user not found', async () => {
    mockFindOneAdmin.mockResolvedValue()

    await login(req, res, { userModel: 'Admin' })

    expect(mockFindOneAdmin).toHaveBeenCalledWith({
      email: 'test@test.com',
      removed: false,
    })
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'No account with this email has been registered',
      })
    )
  })

  it('should return error if user is disabled', async () => {
    mockFindOneAdmin.mockResolvedValue({ ...mockUser, enabled: false })

    await login(req, res, { userModel: 'Admin' })

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Your account is disabled, contact your account administrator',
      })
    )
  })

  it('call authUser if th information is valid', async () => {
    mockFindOneAdmin.mockResolvedValue(mockUser)
    mockFindOneAdminPassword.mockResolvedValue(mockPassword)

    await login(req, res, { userModel: 'Admin' })

    expect(authUser).toHaveBeenCalledWith(req, res, {
      user: mockUser,
      databasePassword: mockPassword,
      password: '123456',
      UserPasswordModel: expect.any(Object),
    })
  })
})
