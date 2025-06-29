import { authUser } from '~/controllers/middlewareControllers/createAuthMiddleware/authUser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Sau khi mock, tất cả các hàm như bcrypt compare đều là jest.fn()
jest.mock('bcrypt')
jest.mock('jsonwebtoken')

describe('authUser', () => {
  // mock_user
  const mockUser = {
    _id: 'user123',
    name: 'Thang',
    surname: 'Tran Duc',
    role: 'admin',
    email: 'thang2k6adu@gmail.com',
    photo: 'photo.jpg',
    cloud: 'vn',
  }

  // mock req
  const mockReq = {
    body: {
      remember: false,
    },
  }

  // mock_res
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }

  // mock userPasswordModel
  const mockUserPasswordModel = {
    findOneAndUpdate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Check if return 403 when password does not match
  it('should return 403 if password does not match', async () => {
    bcrypt.compare.mockResolvedValue(false)

    // Call authUser with bcrypt.compare always = false
    await authUser(mockReq, mockRes, {
      user: mockUser,
      databasePassword: { password: 'hashed_pass' },
      password: 'wrong_password',
      UserPasswordModel: mockUserPasswordModel,
    })

    // status 403
    expect(mockRes.status).toHaveBeenCalledWith(403)
    // return json
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Invalid credentials',
    })
  })

  // Check if return 200 and token when password matches
  it('should return 200 with token if password matches', async () => {
    bcrypt.compare.mockResolvedValue(true)
    jwt.sign.mockReturnValue('mock_token')
    mockUserPasswordModel.exec.mockResolvedValue({}) //Fake update

    // Call authUser with bcrypt.compare = true, jwt sign = mock_token and fake update
    await authUser(mockReq, mockRes, {
      user: mockUser,
      databasePassword: { password: 'hashed_pass' },
      password: 'correct_password',
      UserPasswordModel: mockUserPasswordModel,
    })

    // check bcrypt compare
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'correct_password',
      'hashed_pass'
    )

    // check jwt.sign
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: mockUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    // check findOneAndUpdate
    expect(mockUserPasswordModel.findOneAndUpdate).toHaveBeenCalledWith(
      { user: mockUser._id },
      { $push: { loggedSessions: 'mock_token' } },
      { new: true }
    )

    // test xem có trả về userid và token hay  không
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: expect.objectContaining({
          _id: mockUser._id,
          token: 'mock_token',
        }),
        message: 'Successfully login user',
      })
    )
  })
})
