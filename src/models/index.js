// Import all models to ensure they are registered with Mongoose
// This file should be imported before any controllers or routes

// Core models
import { Admin } from './coreModels/Admin.js'
import { AdminPassword } from './coreModels/AdminPassword.js'
import { SettingModel } from './coreModels/Setting.js'

// App models
import { Client } from './appModels/Client.js'
import { Invoice } from './appModels/Invoice.js'
import { Payment } from './appModels/Payment.js'
import { PaymentMode } from './appModels/PaymentMode.js'
import { Quote } from './appModels/Quote.js'
import { Taxes } from './appModels/Taxes.js'

// Export all models for convenience
export {
  // Core models
  Admin,
  AdminPassword,
  SettingModel,
  // App models
  Client,
  Invoice,
  Payment,
  PaymentMode,
  Quote,
  Taxes,
}
