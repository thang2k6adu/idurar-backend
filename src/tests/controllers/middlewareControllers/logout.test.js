import mongoose from 'mongoose'
import { logout } from '~/controllers/middlewareControllers/logout'

jest.mock('mongoose', () => ({
  model: jest.fn(),
}))

describe('logout', () => {
  const mockFindOneAndUpdate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({}),
  })

  const reqWithToken = {
    headers: {
      authorization: 'Bearer token123',
    },
    admin: {
      _id: '123',
    },
  }

  const reqWithoutToken = {
    headers: {},
    admin: {
      _id: '123',
    },
  }

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mongoose.model.mockImplementation((modelName) => {
      if (modelName == 'AdminPassword') {
        return {
          findOneAndUpdate: mockFindOneAndUpdate,
        }
      }
    })
  })
  // if have token
  it('should remove token from loggedSessions when token is provided', async () => {
    await logout(reqWithToken, res, { userModel: 'Admin' })

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { user: '123' },
      { $pull: { loggedSessions: 'token123' } },
      { new: true }
    )
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Successfully logout',
      })
    )
  })

  // if don't have token
  it('should remove all tokens from loggedSessions when no token is provided', async () => {
    await logout(reqWithoutToken, res, { userModel: 'Admin' })

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { user: '123' },
      { $pull: { loggedSessions: [] } },
      { new: true }
    )
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Successfully logout',
      })
    )
  })
})
