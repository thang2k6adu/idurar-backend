// test read
// Test case 1: should return 200 and document when found
// Test case 2: should return 404 when document not found
import { read } from '~/controllers/appControllers/invoiceController/read'
import mongoose from 'mongoose'

jest.mock('mongoose', () => ({
  model: jest.fn(),
}))

describe('invoiceController read', () => {
  let req, res, findOneMock, populateMock, execMock, InvoiceModelMock

  beforeEach(() => {
    jest.clearAllMocks()
    req = { params: { id: 'test-id' } }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    execMock = jest.fn()
    populateMock = jest.fn(() => ({ exec: execMock }))
    findOneMock = jest.fn(() => ({ populate: populateMock }))

    function InvoiceModelMock() {}
    InvoiceModelMock.findOne = findOneMock

    mongoose.model.mockImplementation((modelName) => {
      if (modelName === 'Invoice') return InvoiceModelMock
      return null
    })
  })

  it('Test case 1: should return 200 and document when found', async () => {
    const fakeDoc = { _id: 'test-id', name: 'Test Invoice' }
    execMock.mockResolvedValueOnce(fakeDoc)
    await read(req, res)
    expect(findOneMock).toHaveBeenCalledWith({ _id: 'test-id', removed: false })
    expect(populateMock).toHaveBeenCalledWith('createdBy', 'name')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: fakeDoc,
      message: 'Get document successfully',
    })
  })

  it('Test case 2: should return 404 when document not found', async () => {
    execMock.mockResolvedValueOnce(null)
    await read(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'No document found',
    })
  })
})
