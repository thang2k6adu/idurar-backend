// test paginatedList
// Test case 1: should return paginated results with default params
// Test case 2: should handle pagination params
// Test case 3: should apply filter and equal in query
// Test case 4: should apply $or when q and fields are provided
// Test case 5: should return correct message when no documents found
import { paginatedList } from '~/controllers/appControllers/invoiceController/paginatedList'
import mongoose from 'mongoose'

jest.mock('mongoose', () => ({
  model: jest.fn(),
}))

jest.mock('~/helpers', () => ({
  escapeRegex: jest.fn((str) => str),
}))

const { escapeRegex } = require('~/helpers')

describe('invoiceController paginatedList', () => {
  let req, res, findMock, countDocumentsMock, sortMock, limitMock, skipMock, populateMock, execMock, InvoiceModelMock

  beforeEach(() => {
    jest.clearAllMocks()
    req = { query: {} }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    execMock = jest.fn()
    populateMock = jest.fn(() => ({ exec: execMock }))
    sortMock = jest.fn(() => ({ populate: populateMock }))
    limitMock = jest.fn(() => ({ sort: sortMock }))
    skipMock = jest.fn(() => ({ limit: limitMock }))
    findMock = jest.fn(() => ({ skip: skipMock }))
    countDocumentsMock = jest.fn()

    function InvoiceModelMock() {}
    InvoiceModelMock.find = findMock
    InvoiceModelMock.countDocuments = countDocumentsMock

    mongoose.model.mockImplementation((modelName) => {
      if (modelName === 'Invoice') return InvoiceModelMock
      return null
    })
  })

  it('Test case 1: should return paginated results with default params', async () => {
    const fakeResults = [{ _id: '1' }, { _id: '2' }]
    execMock.mockResolvedValueOnce(fakeResults)
    countDocumentsMock.mockResolvedValueOnce(2)

    await paginatedList(req, res)

    expect(findMock).toHaveBeenCalledWith({ removed: false })
    expect(skipMock).toHaveBeenCalledWith(0)
    expect(limitMock).toHaveBeenCalledWith(10)
    expect(sortMock).toHaveBeenCalledWith({ enabled: -1 })
    expect(populateMock).toHaveBeenCalledWith('createdBy', 'name')
    expect(countDocumentsMock).toHaveBeenCalledWith({ removed: false })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: fakeResults,
        pagination: { page: 1, totalPages: 1, totalDocuments: 2 },
        message: 'Successfully found all documents',
      })
    )
  })

  it('Test case 2: should handle pagination params', async () => {
    req.query = { page: '2', limit: '5' }
    execMock.mockResolvedValueOnce([])
    countDocumentsMock.mockResolvedValueOnce(0)
    await paginatedList(req, res)
    expect(skipMock).toHaveBeenCalledWith(5)
    expect(limitMock).toHaveBeenCalledWith(5)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: { page: 2, totalPages: 0, totalDocuments: 0 },
        message: 'No documents found by this request',
      })
    )
  })

  it('Test case 3: should apply filter and equal in query', async () => {
    req.query = { filter: 'status', equal: 'paid' }
    execMock.mockResolvedValueOnce([])
    countDocumentsMock.mockResolvedValueOnce(0)
    await paginatedList(req, res)
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ removed: false, status: 'paid' })
    )
    expect(countDocumentsMock).toHaveBeenCalledWith(
      expect.objectContaining({ removed: false, status: 'paid' })
    )
  })

  it('Test case 4: should apply $or when q and fields are provided', async () => {
    req.query = { q: 'abc', fields: 'name,email' }
    execMock.mockResolvedValueOnce([])
    countDocumentsMock.mockResolvedValueOnce(0)
    await paginatedList(req, res)
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        removed: false,
        $or: [
          { name: { $regex: /abc/i } },
          { email: { $regex: /abc/i } },
        ],
      })
    )
  })

  it('Test case 5: should return correct message when no documents found', async () => {
    execMock.mockResolvedValueOnce([])
    countDocumentsMock.mockResolvedValueOnce(0)
    await paginatedList(req, res)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: [],
        message: 'No documents found by this request',
      })
    )
  })
})
