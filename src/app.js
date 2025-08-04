import express from 'express'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { errorHandlers } from '~/handlers/errorHandlers'

// 👇 Đừng import router ở đây
// import coreAuth from '~/routes/coreRoutes/coreAuth'
// import appApi from '~/routes/appRoutes/appApi'
// import adminAuth from './controllers/coreControllers/adminAuth'
// import coreApi from '~/routes/coreRoutes/coreApi'
// import coreDownloadRouter from '~/routes/coreRoutes/coreDownloadRouter'
// import corePublicRouter from '~/routes/coreRoutes/corePublicRouter'

export function createApp({ coreAuth, adminAuth, coreApi, appApi, coreDownloadRouter, corePublicRouter }) {
  const app = express()

  app.use(cors({ origin: true, credentials: true }))
  app.use(cookieParser())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(compression())

  app.get('/', (req, res) => {
    res.json({ message: 'ERP Backend API is running' })
  })

  app.use('/api', coreAuth)
  app.use('/api', adminAuth.isValidAuthToken, coreApi)
  app.use('/api', adminAuth.isValidAuthToken, appApi)
  app.use('/download', coreDownloadRouter)
  app.use('/public', corePublicRouter)

  app.use(errorHandlers.notFound)
  app.use(errorHandlers.productionErrors)

  return app
}
