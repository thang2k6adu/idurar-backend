// Test case 1: use default pagination and sorting
// Test case 2: calculate skip correctly for page=2 and limit=5
// Test case 3: apply filter and equal in query
// Test case 4: apply $or when q and fields are provided
// Test case 5: return correct pagination and message when no documents found
// Test case 6: return documents and pagination correctly when data exists
import { paginatedList } from '~/controllers/middlewareControllers/createCRUDController/paginatedList'

describe('paginatedList', () => {
  let req, res

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    req = { query: {} }
  })

  const setupModelMock = (mockResults, mockCount) => {
    const execMock = jest.fn().mockResolvedValue(mockResults)
    const populateMock = jest.fn(() => ({ exec: execMock }))
    const sortMock = jest.fn(() => ({ populate: populateMock }))
    const limitMock = jest.fn(() => ({ sort: sortMock }))
    const skipMock = jest.fn(() => ({ limit: limitMock }))
    const findMock = jest.fn(() => ({ skip: skipMock }))

    const countDocumentsMock = jest.fn().mockResolvedValue(mockCount)

    const MockModel = {
      find: findMock,
      countDocuments: countDocumentsMock,
    }

    return { MockModel, findMock, countDocumentsMock, skipMock, limitMock, sortMock }
  }

  it('uses default pagination and sorting', async () => {
    const { MockModel, skipMock, sortMock } = setupModelMock([], 0)
    await paginatedList(MockModel, req, res)

    expect(skipMock).toHaveBeenCalledWith(0)
    expect(sortMock).toHaveBeenCalledWith({ enabled: -1 })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('calculates skip correctly for page=2 and limit=5', async () => {
    req.query = { page: '2', limit: '5' }
    const { MockModel, skipMock } = setupModelMock([], 0)

    await paginatedList(MockModel, req, res)

    expect(skipMock).toHaveBeenCalledWith(5)
  })

  it('applies filter and equal in query', async () => {
    req.query = { filter: 'role', equal: 'admin' }
    const { MockModel, findMock } = setupModelMock([], 0)

    await paginatedList(MockModel, req, res)

    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        removed: false,
        role: 'admin',
      })
    )
  })

  it('applies $or when q and fields are provided', async () => {
    req.query = { q: 'abc', fields: 'name,email' }
    const { MockModel, findMock } = setupModelMock([], 0)

    await paginatedList(MockModel, req, res)

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

  it('returns correct pagination and message when no documents found', async () => {
    const { MockModel } = setupModelMock([], 0)

    await paginatedList(MockModel, req, res)

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: [],
        pagination: { page: 1, totalPages: 0, totalDocuments: 0 },
        message: 'No documents found by this request',
      })
    )
  })

  it('returns documents and pagination correctly when data exists', async () => {
    const docs = [{ name: 'Test' }]
    const { MockModel } = setupModelMock(docs, 25)
    req.query = { limit: '10', page: '2' }

    await paginatedList(MockModel, req, res)

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: docs,
        pagination: { page: 2, totalPages: 3, totalDocuments: 25 },
        message: 'Successfully found all documents',
      })
    )
  })
})
