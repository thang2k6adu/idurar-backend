import mongoose from 'mongoose'
import { env } from '~/config/environment.js'
import { globSync } from 'glob'
import path from 'path'
import { pathToFileURL } from 'url'

;(async () => {
  try {
    await mongoose.connect(env.DATABASE)

    // 1. Import models
    const modelsFiles = globSync('./src/models/!(*utils)/**/*.js')
    for (const filePath of modelsFiles) {
      const absolutePath = path.resolve(process.cwd(), filePath)
      await import((absolutePath))
    }

    // 2. Import controller/routes SAU model
    const { default: coreAuth } = await import('~/routes/coreRoutes/coreAuth.js')
    const { default: coreApi } = await import('~/routes/coreRoutes/coreApi.js')
    const { default: appApi } = await import('~/routes/appRoutes/appApi.js')
    const { default: adminAuth } = await import('~/controllers/coreControllers/adminAuth')
    const { default: coreDownloadRouter } = await import('~/routes/coreRoutes/coreDownloadRouter.js')
    const { default: corePublicRouter } = await import('~/routes/coreRoutes/corePublicRouter.js')

    const { createApp } = await import('./app.js')
    const app = createApp({
      coreAuth,
      adminAuth,
      coreApi,
      appApi,
      coreDownloadRouter,
      corePublicRouter
    })

    app.set('port', env.PORT || 8888)
    const server = app.listen(app.get('port'), () => {
      console.log(`🚀 Server running on PORT: ${server.address().port}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
})()
