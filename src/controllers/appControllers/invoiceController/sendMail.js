import mongoose from 'mongoose'

export const sendMail = async (req, res) => {
  return res.status(200).json({
    success: true,
    result: null,
    message: 'Please upgrade to Premium Versionc to have full features'
  })
}