import mongoose from 'mongoose'
import { env } from '~/config/environment.js'

// Import all models first to ensure they are registered with Mongoose
import '~/models/index.js'

import app from './app.js'

mongoose.connect(env.DATABASE)

mongoose.connection.on('error', (error) => {
  console.log('🔥 MongoDB connection error → check your .env file')
  console.error(`🚫 Error → : ${error.message}`)
})

app.set('port', env.PORT || 8888)
const server = app.listen(app.get('port'), () => {
  // eslint-disable-next-line no-console
  console.log(`Express running → On PORT : ${server.address().port}`)
})
