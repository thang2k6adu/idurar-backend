import dotenv from 'dotenv'
import { globSync } from 'glob'
import fs from 'fs'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'

import Admin from '~/models/coreModels/Admin.js'
import AdminPassword from '~/models/coreModels/AdminPassword.js'
import Setting from '~/models/coreModels/Setting.js'
import Taxes from '~/models/appModels/Taxes'
import PaymentMode from '~/models/appModels/PaymentMode'

// Load environment variables
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

// Connect to MongoDB
mongoose.connect(process.env.DATABASE)

async function setupApp() {
  try {
    const demoAdmin = {
      email: 'admin@demo.com',
      name: 'THANG',
      surname: 'DEP CHAI',
      enabled: true,
      role: 'owner',
    }
    const result = await new Admin(demoAdmin).save()

    const hashedPassword = await bcrypt.hash('admin123', 10)

    const AdminPasswordData = {
      password: hashedPassword,
      emailVerified: true,
      user: result._id,
    }
    await new AdminPassword(AdminPasswordData).save()

    console.log('👍 Admin created : Done!')

    // Load settings
    const settingFiles = []
    const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json')
    for (const filePath of settingsFiles) {
      const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      settingFiles.push(...file)
    }
    // insertMany only accepts an array
    await Setting.insertMany(settingFiles)
    console.log('👍 Settings created : Done!')

    // Taxes
    await Taxes.insertMany([{ taxName: 'Tax 0%', taxValue: '0', isDefault: true }])
    console.log('👍 Taxes created : Done!')

    // Payment Modes
    await PaymentMode.insertMany([
      {
        name: 'Default Payment',
        description: 'Default Payment Mode (Cash , Wire Transfert)',
        isDefault: true,
      },
    ])
    console.log('👍 PaymentMode created : Done!')

    console.log('🥳 Setup completed : Success!')
    process.exit()
  } catch (error) {
    console.log('\n🚫 Error! The Error info is below')
    console.log(error)
    process.exit()
  }
}

setupApp()
