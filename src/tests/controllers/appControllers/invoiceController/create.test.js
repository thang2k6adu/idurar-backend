// test create invoice
// Test case 1: should create invoice and return success
// Test case 2: should return 400 if validation fails
// Test case 3: should calculate totals and paymentStatus correctly
import { create } from '~/controllers/appControllers/invoiceController/create'
import mongoose from 'mongoose'

jest.mock('mongoose', () => ({
  model: jest.fn(),
}))

jest.mock('~/helpers', () => ({
  calculate: {
    add: jest.fn((a, b) => a + b),
    multiply: jest.fn((a, b) => a * b),
    sub: jest.fn((a, b) => a - b),
  },
}))

jest.mock('~/middlewares/settings/increaseBySettingKey', () => ({
  increaseBySettingKey: jest.fn(),
}))

jest.mock(
  '~/controllers/appControllers/invoiceController/schemaValidate',
  () => {
    const Joi = require('joi')
    return {
      schema: {
        validate: jest.fn((body) => {
          // simple valid: must have number, year, status, date, items (array)
          if (
            !body.number ||
            !body.year ||
            !body.status ||
            !body.date ||
            !Array.isArray(body.items)
          ) {
            return {
              error: { details: [{ message: 'Validation error' }] },
              value: null,
            }
          }
          return { error: null, value: body }
        }),
      },
    }
  }
)

const { calculate } = require('~/helpers')
const {
  increaseBySettingKey,
} = require('~/middlewares/settings/increaseBySettingKey')
const {
  schema,
} = require('~/controllers/appControllers/invoiceController/schemaValidate')

describe('invoiceController create', () => {
  let req, res, saveMock, findOneAndUpdateMock, InvoiceModelMock

  beforeEach(() => {
    jest.clearAllMocks()
    req = {
      body: {
        client: 'clientId',
        number: 1,
        year: 2024,
        status: 'draft',
        notes: '',
        date: '2024-01-01',
        items: [
          { itemName: 'item1', quantity: 2, price: 10, total: 20 },
          { itemName: 'item2', quantity: 1, price: 5, total: 5 },
        ],
        taxRate: 10,
        discount: 0,
      },
      admin: { _id: 'adminId' },
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    saveMock = jest.fn().mockResolvedValue({ _id: 'invoiceId', ...req.body })
    findOneAndUpdateMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: 'invoiceId',
        pdf: 'invoice-invoiceId.pdf',
        ...req.body,
      }),
    })
    class InvoiceModelMock {
      constructor(body) {
        this.body = body
        this.save = saveMock
      }

      static findOneAndUpdate = findOneAndUpdateMock
    }
    mongoose.model.mockImplementation((modelName) => {
      if (modelName === 'Invoice') return InvoiceModelMock
      return null
    })
  })

  it('Test case 1: should create invoice and return success', async () => {
    await create(req, res)
    expect(saveMock).toHaveBeenCalled()
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: 'invoiceId' },
      { pdf: 'invoice-invoiceId.pdf' },
      { new: true }
    )
    expect(increaseBySettingKey).toHaveBeenCalledWith({
      settingKey: 'last_invoice_number',
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Invoice created successfully',
        result: expect.objectContaining({
          _id: 'invoiceId',
          pdf: 'invoice-invoiceId.pdf',
        }),
      })
    )
  })

  it('Test case 2: should return 400 if validation fails', async () => {
    req.body = { ...req.body, number: undefined } // thiếu trường bắt buộc
    await create(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation error',
      })
    )
    expect(saveMock).not.toHaveBeenCalled()
    expect(findOneAndUpdateMock).not.toHaveBeenCalled()
    expect(increaseBySettingKey).not.toHaveBeenCalled()
  })

  it('Test case 3: should calculate totals and paymentStatus correctly', async () => {
    // setup mock cho calculate
    calculate.multiply.mockImplementation((a, b) => a * b)
    calculate.add.mockImplementation((a, b) => a + b)
    calculate.sub.mockImplementation((a, b) => a - b)
    req.body.discount = 0
    await create(req, res)
    // subTotal = 2*10 + 1*5 = 25
    // taxTotal = 25 * 10/100 = 2.5
    // total = 25 + 2.5 = 27.5
    expect(calculate.multiply).toHaveBeenCalledWith(2, 10)
    expect(calculate.multiply).toHaveBeenCalledWith(1, 5)
    expect(calculate.multiply).toHaveBeenCalledWith(25, 0.1)
    expect(calculate.add).toHaveBeenCalledWith(25, 2.5)
    expect(calculate.sub).toHaveBeenCalledWith(27.5, 0)
    // paymentStatus = unpaid vì 27.5 - 0 !== 0
    expect(saveMock).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
