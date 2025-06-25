import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const authUser = async (
  req,
  res,
  { user, databasePassword, password, UserPasswordModel }
) => {
  const isMatch = await bcrypt.compare(password, databasePassword.password)

  if (!isMatch) {
    return res.status(403).json({
      succes: false,
      result: null,
      message: 'Invalid credentials',
    })
  }

  if (isMatch === true) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: req.body.remember ? 365 * 24 + 'h' : '24h',
    })

    // find hay findOneAndUpdate không chạy ngay mà trả về Query Object (select(), exec())
    // exec sẽ chạy khi hàm được chạy với await, ở đây viết exec để rõ ràng hơn
    await UserPasswordModel.findOneAndUpdate(
      { user: user._id },
      { $push: { loggedSessions: token } },
      // trả về document sau khi cập nhật (mặc định là trả về cái trước khi cập nhật)
      { new: true }
    ).exec()

    // sau này sẽ implement cookie tránh XSS
    // res.cookie(`token_${user.cloud}`, token, {
    //   maxAge: req.body.remember ? 365 * 24 * 60 * 60 * 1000 : null, // thời gian sống của cookie
    //   sameSite: 'None',       // Cho phép gửi cookie giữa các domain khác nhau (CORS)
    //   httpOnly: true,         // Cookie không thể bị truy cập bởi JavaScript phía client
    //   secure: true,           // Chỉ gửi cookie qua HTTPS
    //   domain: req.hostname,   // Giới hạn cookie chỉ cho domain hiện tại
    //   path: '/',              // Cookie có hiệu lực trên toàn bộ website
    //   Partitioned: true       // Cho phép cookie được "partitioned" (dành cho third-party context)
    // });
    res.status(200).json({
      success: true,
      result: {
        _id: user._id,
        name: user.name,
        surname: user.surname,
        role: user.role,
        email: user.email,
        email: user.email,
        photo: user.photo,
        token: token,
        maxAge: req.body.remember ? 365 : null,
      },
      message: 'Successfully login user',
    })
  } else {
    return res.status(403).json({
      succes: false,
      result: null,
      message: 'Invalid credentials',
    })
  }
}
