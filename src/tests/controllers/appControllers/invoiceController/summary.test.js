// test summary
// Test case 1: should return summary data with default type
// Test case 2: should return 400 if type is invalid
import { summary } from '~/controllers/appControllers/invoiceController/summary'
import mongoose from 'mongoose'

jest.mock('mongoose', () => ({
  model: jest.fn(),
}))

jest.mock('moment', () => {
  const m = () => m
  m.clone = () => m
  m.startOf = () => m
  m.endOf = () => m
  m.toDate = () => new Date()
  return m
})

jest.mock('~/middlewares/settings', () => ({
  loadSettings: jest.fn().mockResolvedValue({}),
}))

const { loadSettings } = require('~/middlewares/settings')

describe('invoiceController summary', () => {
  let req, res, aggregateMock, InvoiceModelMock

  beforeEach(() => {
    jest.clearAllMocks()
    req = { query: {} }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    aggregateMock = jest.fn()
    function InvoiceModelMock() {}
    InvoiceModelMock.aggregate = aggregateMock
    mongoose.model.mockImplementation((modelName) => {
      if (modelName === 'Invoice') return InvoiceModelMock
      return null
    })
  })

  it('Test case 1: should return summary data with default type', async () => {
    // Mock aggregate for summary
    aggregateMock
      .mockResolvedValueOnce([
        {
          totalInvoice: { total: 1000, count: 10 },
          statusCounts: [
            { status: 'draft', count: 2 },
            { status: 'paid', count: 3 },
          ],
          paymentStatusCounts: [
            { status: 'unpaid', count: 4 },
            { status: 'partially', count: 1 },
          ],
          overdueCounts: [
            { status: 'overdue', count: 2 },
          ],
        },
      ])
      .mockResolvedValueOnce([{ total_amount: 500 }]) // unpaid aggregate

    await summary(req, res)
    expect(aggregateMock).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: expect.objectContaining({
          total: 1000,
          total_undue: 500,
          type: 'month',
          performance: expect.any(Array),
        }),
        message: expect.stringContaining('Successfully found all invoices'),
      })
    )
  })

  it('Test case 2: should return 400 if type is invalid', async () => {
    req.query = { type: 'invalid' }
    await summary(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid type',
      })
    )
  })
})
