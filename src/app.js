import express from 'express'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { authRoutes } from '~/routes/auth'
import { apiRoutes } from '~/routes/api'
import { errorHandlers} from '~/middleware/errorHandlers'

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
app.use(compression())

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'ERP Backend API is running' })
})
app.use('/api/auth', authRoutes)
// app.use('/api', apiRoutes)

// Error handling
app.use(errorHandlers.notFound)
app.use(errorHandlers.productionError)

export default app
