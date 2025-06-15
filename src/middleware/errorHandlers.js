const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

const productionError = (err, req, res, next) => {
  res.status(res.statusCode || 500).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  })
}

export const errorHandlers = {
  notFound,
  productionError,
}
