// test remove
// Test case 1: should remove invoice and related payments, return 200
// Test case 2: should return 404 if invoice not found
import { remove } from '~/controllers/appControllers/invoiceController/remove'
import mongoose from 'mongoose'

jest.mock('mongoose', () => ({
  model: jest.fn(),
}))

describe('invoiceController remove', () => {
  let req, res, findOneAndUpdateMock, execMock, updateManyMock, InvoiceModelMock, PaymentModelMock

  beforeEach(() => {
    jest.clearAllMocks()
    req = { params: { id: 'test-id' } }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    execMock = jest.fn()
    findOneAndUpdateMock = jest.fn(() => ({ exec: execMock }))
    updateManyMock = jest.fn()

    function InvoiceModelMock() {}
    InvoiceModelMock.findOneAndUpdate = findOneAndUpdateMock
    function PaymentModelMock() {}
    PaymentModelMock.updateMany = updateManyMock

    mongoose.model.mockImplementation((modelName) => {
      if (modelName === 'Invoice') return InvoiceModelMock
      if (modelName === 'Payment') return PaymentModelMock
      return null
    })
  })

  it('Test case 1: should remove invoice and related payments, return 200', async () => {
    const fakeInvoice = { _id: 'test-id', removed: true, name: 'Test Invoice' }
    execMock.mockResolvedValueOnce(fakeInvoice)
    updateManyMock.mockResolvedValueOnce({ nModified: 1 })
    await remove(req, res)
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: 'test-id', removed: false },
      { $set: { removed: true } },
      { new: true }
    )
    expect(updateManyMock).toHaveBeenCalledWith(
      { invoice: 'test-id' },
      { $set: { removed: true } }
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: fakeInvoice,
      message: 'Invoice removed successfully',
    })
  })

  it('Test case 2: should return 404 if invoice not found', async () => {
    execMock.mockResolvedValueOnce(null)
    await remove(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'No document found',
    })
    expect(updateManyMock).not.toHaveBeenCalled()
  })
})
