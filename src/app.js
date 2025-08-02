import express from 'express'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { errorHandlers } from '~/handlers/errorHandlers'
import coreAuth from '~/routes/coreRoutes/coreAuth'
import appApi from '~/routes/appRoutes/appApi'
import adminAuth from './controllers/coreControllers/adminAuth'
import coreApi from '~/routes/coreRoutes/coreApi'

const app = express()

// Middleware setup
app.use(
  cors({
    origin: true,
    credentials: true,
  })
)

// Dùng để truy cập cookie dễ dàng từ request
app.use(cookieParser())

// Dùng để xử lý JSON trong request body
app.use(express.json())

// Dùng để xử lý URL encoded data trong request body
app.use(express.urlencoded({ extended: true }))

// Dùng để nén response body
// When header has Accept-Encoding: gzip, deflate, br, it will be compressed
// Compression is automatically applied to all responses
app.use(compression())

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'ERP Backend API is running' })
})
app.use('/api', coreAuth)
app.use('/api', adminAuth.isValidAuthToken, coreApi)
app.use('/api', adminAuth.isValidAuthToken, coreAuth)
app.use('/api', adminAuth.isValidAuthToken, appApi)

// app.use('/api', apiRoutes)

// Error handling
// Không có route khớp, we 404 them and forward to error handler
app.use(errorHandlers.notFound)

// production error handler
// if (process.env.NODE_ENV === 'development') {
//   app.use(errorHandlers.developmentErrors)
// } else {
//   app.use(errorHandlers.productionError)
// }
// run when next(error) is called, throw error, khong bat loi
app.use(errorHandlers.productionErrors)

export default app
