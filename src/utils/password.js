import bcrypt from 'bcryptjs'
import { generate as uniqueId } from 'shortid'

// Hash password with salt
export const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10)
  const passwordHash = bcrypt.hashSync(password, salt)
  // no need to return salt
  return { passwordHash }
}

// Verify password
export const verifyPassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword)
}
