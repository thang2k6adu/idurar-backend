// test update
// Test case 1: should update invoice and return success
// Test case 2: should return 400 if validation fails
// Test case 3: should return 400 if items is empty
// Test case 4: should calculate totals and paymentStatus correctly
import { update } from '~/controllers/appControllers/invoiceController/update'
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

jest.mock('~/controllers/appControllers/invoiceController/schemaValidate', () => {
  return {
    schema: {
      validate: jest.fn((body) => {
        if (!body.number || !body.year || !body.status || !body.date || !Array.isArray(body.items)) {
          return {
            error: { details: [{ message: 'Validation error' }] },
            value: null,
          }
        }
        return { error: null, value: body }
      }),
    },
  }
})

const { calculate } = require('~/helpers')
const { schema } = require('~/controllers/appControllers/invoiceController/schemaValidate')

describe('invoiceController update', () => {
  let req, res, findOneMock, findOneAndUpdateMock, execMock, InvoiceModelMock

  beforeEach(() => {
    jest.clearAllMocks()
    req = {
      params: { id: 'test-id' },
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
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    execMock = jest.fn()
    findOneMock = jest.fn()
    findOneAndUpdateMock = jest.fn(() => ({ exec: execMock }))
    function InvoiceModelMock() {}
    InvoiceModelMock.findOne = findOneMock
    InvoiceModelMock.findOneAndUpdate = findOneAndUpdateMock
    mongoose.model.mockImplementation((modelName) => {
      if (modelName === 'Invoice') return InvoiceModelMock
      return null
    })
  })

  it('Test case 1: should update invoice and return success', async () => {
    findOneMock.mockResolvedValueOnce({ credit: 0 })
    execMock.mockResolvedValueOnce({ _id: 'test-id', ...req.body })
    await update(req, res)
    expect(findOneMock).toHaveBeenCalledWith({ _id: 'test-id', removed: false })
    expect(findOneAndUpdateMock).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: expect.objectContaining({ _id: 'test-id' }),
      message: 'Successfully updated invoice',
    })
  })

  it('Test case 2: should return 400 if validation fails', async () => {
    req.body = { ...req.body, number: undefined }
    await update(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation error',
      })
    )
    expect(findOneMock).not.toHaveBeenCalled()
    expect(findOneAndUpdateMock).not.toHaveBeenCalled()
  })

  it('Test case 3: should return 400 if items is empty', async () => {
    req.body.items = []
    findOneMock.mockResolvedValueOnce({ credit: 0 })
    await update(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Items cannot be empty',
      })
    )
    expect(findOneAndUpdateMock).not.toHaveBeenCalled()
  })

  it('Test case 4: should calculate totals and paymentStatus correctly', async () => {
    // setup mock cho calculate
    calculate.multiply.mockImplementation((a, b) => a * b)
    calculate.add.mockImplementation((a, b) => a + b)
    calculate.sub.mockImplementation((a, b) => a - b)
    findOneMock.mockResolvedValueOnce({ credit: 0 })
    req.body.discount = 0
    await update(req, res)
    // subTotal = 2*10 + 1*5 = 25
    // taxTotal = 25 * 10/100 = 2.5
    // total = 25 + 2.5 = 27.5
    expect(calculate.multiply).toHaveBeenCalledWith(2, 10)
    expect(calculate.multiply).toHaveBeenCalledWith(1, 5)
    expect(calculate.multiply).toHaveBeenCalledWith(25, 0.1)
    expect(calculate.add).toHaveBeenCalledWith(25, 2.5)
    expect(calculate.sub).toHaveBeenCalledWith(27.5, 0)
    expect(findOneAndUpdateMock).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('Test case 5: should set paymentStatus to partially if credit > 0', async () => {
    findOneMock.mockResolvedValueOnce({ credit: 100 })
    req.body.discount = 0
    calculate.multiply.mockImplementation((a, b) => a * b)
    calculate.add.mockImplementation((a, b) => a + b)
    calculate.sub.mockImplementation((a, b) => a - b)
    await update(req, res)
    // paymentStatus = partially vì credit > 0
    expect(findOneAndUpdateMock).toHaveBeenCalled()
    const calledBody = findOneAndUpdateMock.mock.calls[0][1]
    expect(calledBody.paymentStatus).toBe('partially')
  })
})
