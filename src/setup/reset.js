import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Admin from '~/models/coreModels/Admin.js'
import AdminPassword from '~/models/coreModels/AdminPassword.js'
import Setting from '~/models/coreModels/Setting.js'
import PaymentMode from '~/models/appModels/PaymentMode.js'
import Taxes from '~/models/appModels/Taxes.js'

// Load environment variables
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

// Connect to MongoDB
mongoose.connect(process.env.DATABASE)

async function deleteData() {
  await Admin.deleteMany()
  await AdminPassword.deleteMany()
  await PaymentMode.deleteMany()
  await Taxes.deleteMany()
  console.log('👍 Admin Deleted. To setup demo admin data, run\n\n\t yarn setup\n\n')
  await Setting.deleteMany()
  console.log('👍 Setting Deleted. To setup Setting data, run\n\n\t yarn setup\n\n')

  process.exit()
}

deleteData()
