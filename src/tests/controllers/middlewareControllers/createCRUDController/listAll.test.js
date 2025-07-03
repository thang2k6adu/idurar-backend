// Test case 1: return documents without enabled filter
// Test case 2: return documents with enabled=true
// Test case 3: return documents with enabled=false
// Test case 4: return message for empty collection
// Test case 5: sort ascending if sort=asc
import { listAll } from '~/controllers/middlewareControllers/createCRUDController/listAll'

describe('listAll controller', () => {
  let req, res

  beforeEach(() => {
    req = { query: {} }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
  })

  // Hàm tạo model mock với chuỗi method: find → sort → populate → exec
  const setupMockModel = (mockData) => {
    const execMock = jest.fn().mockResolvedValue(mockData)
    const populateMock = jest.fn(() => ({ exec: execMock }))
    const sortMock = jest.fn(() => ({ populate: populateMock }))
    const findMock = jest.fn(() => ({ sort: sortMock }))

    const MockModel = { find: findMock }

    return { MockModel, findMock, sortMock, populateMock, execMock }
  }

  it('should return documents without enabled filter', async () => {
    req.query = {}
    const data = [{ _id: '1' }]
    const { MockModel, findMock, sortMock } = setupMockModel(data)

    await listAll(MockModel, req, res)

    expect(findMock).toHaveBeenCalledWith({ removed: false })
    expect(sortMock).toHaveBeenCalledWith({ created: 'desc' }) // default sort
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: data,
      message: 'Successfully found all documents',
    })
  })

  it('should return documents with enabled=true', async () => {
    req.query = { enabled: 'true' }
    const data = [{ _id: '2', enabled: true }]
    const { MockModel, findMock } = setupMockModel(data)

    await listAll(MockModel, req, res)

    expect(findMock).toHaveBeenCalledWith({ removed: false, enabled: true })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: data,
      message: 'Successfully found all documents',
    })
  })

  it('should return documents with enabled=false', async () => {
    req.query = { enabled: 'false' }
    const data = [{ _id: '3', enabled: false }]
    const { MockModel, findMock } = setupMockModel(data)

    await listAll(MockModel, req, res)

    expect(findMock).toHaveBeenCalledWith({ removed: false, enabled: false })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: data,
      message: 'Successfully found all documents',
    })
  })

  it('should return message for empty collection', async () => {
    req.query = {}
    const { MockModel } = setupMockModel([])

    await listAll(MockModel, req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: [],
      message: 'No documents found by this request',
    })
  })

  it('should sort ascending if sort=asc', async () => {
    req.query = { sort: 'asc' }
    const data = [{ _id: '4' }]
    const { MockModel, sortMock } = setupMockModel(data)

    await listAll(MockModel, req, res)

    expect(sortMock).toHaveBeenCalledWith({ created: 'asc' })
  })
})
