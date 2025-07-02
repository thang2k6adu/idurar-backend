import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

/**
 * Middleware để xác thực JWT token
 * Kiểm tra tính hợp lệ của token và xác minh người dùng
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 * @param {Object} options - Options object chứa userModel và jwtSecret
 */
export const isValidAuthToken = async (
  req,
  res,
  next,
  { userModel, jwtSecret = 'JWT_SECRET' }
) => {
  try {
    // Lấy model UserPassword và User từ mongoose
    const UserPassword = mongoose.model(userModel + 'Password')
    const User = mongoose.model(userModel)

    // Lấy token từ header Authorization (format: "Bearer <token>")
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')?.[1]

    // Kiểm tra xem có token không
    if (!token) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'No authentication token, authorization denied.',
        jwtExpired: true, // Đánh dấu lỗi liên quan đến JWT để client xử lý
      })
    }

    // Xác minh token bằng JWT secret
    const verified = jwt.verify(token, process.env[jwtSecret])

    // Kiểm tra xem token có hợp lệ không
    if (!verified) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'Token verification failed, authorization denied.',
        jwtExpired: true, // Đánh dấu lỗi JWT để client biết cần refresh hoặc login lại
      })
    }

    // Tìm kiếm thông tin user và userPassword song song để tối ưu performance
    const userPasswordPromise = UserPassword.findOne({
      user: verified.id,
      removed: false,
    })
    const userPromise = User.findOne({
      _id: verified.id,
      removed: false,
    })

    // Chờ cả 2 promise hoàn thành
    const [user, userPassword] = await Promise.all([
      userPromise,
      userPasswordPromise,
    ])

    // Kiểm tra xem user có tồn tại không
    if (!user)
      return res.status(401).json({
        success: false,
        result: null,
        message: 'User does not exist, authorization denied.',
        jwtExpired: true, // Đánh dấu lỗi JWT để client xử lý
      })

    // Kiểm tra xem token có trong danh sách session đang hoạt động không
    // (để ngăn sử dụng token đã logout)
    const { loggedSessions } = userPassword
    if (!loggedSessions.includes(token)) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'User is already logout try to login, authorization denied.',
        jwtExpired: true, // Đánh dấu lỗi JWT để client biết cần login lại
      })
    } else {
      // Token hợp lệ, lưu tên model user vào request để sử dụng ở middleware tiếp theo
      const reqUserName = userModel.toLowerCase()
      req[reqUserName] = user
      next() // Chuyển sang middleware tiếp theo
    }
  } catch (error) {
    // Xử lý lỗi chung (có thể là lỗi JWT expired, invalid format, etc.)
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
      controller: 'isValidAuthToken',
      jwtExpired: true, // Đánh dấu lỗi JWT để client xử lý phù hợp
    })
  }
}
