// Test case 1: return 200 and found documents
// Test case 2: return 200 and no documents found
// Test case 3: search only name if fields param missing
// Test case 4: escape special characters in regex query
import { search } from '~/controllers/middlewareControllers/createCRUDController/search'

describe('search controller', () => {
  let req, res, Model, execMock

  beforeEach(() => {
    req = {
      query: {
        q: 'thang',
        fields: 'name,email',
      },
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    execMock = jest.fn()

    Model = {
      find: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: execMock,
    }
  })

  it('TC1: should return 200 and found documents', async () => {
    const mockResults = [{ _id: '1', name: 'thang', email: 'a@gmail.com' }]
    execMock.mockResolvedValue(mockResults)

    await search(Model, req, res)

    expect(Model.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: /thang/i } },
        { email: { $regex: /thang/i } },
      ],
    })

    expect(Model.where).toHaveBeenCalledWith('removed', false)
    expect(Model.limit).toHaveBeenCalledWith(20)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockResults,
      message: 'Successfully found all documents',
    })
  })

  it('TC2: should return 200 and no documents found', async () => {
    execMock.mockResolvedValue([])

    await search(Model, req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: [],
      message: 'No documents found by this request',
    })
  })

  it('TC3: should search only name if fields param missing', async () => {
    req.query = { q: 'thang' }
    execMock.mockResolvedValue([{ name: 'thang' }])

    await search(Model, req, res)

    expect(Model.find).toHaveBeenCalledWith({
      $or: [{ name: { $regex: /thang/i } }],
    })

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    )
  })

  it('TC4: should escape special characters in regex query', async () => {
    req.query = {
      q: 'thang.*+?^$()[]',
      fields: 'name',
    }

    const escapedRegex = new RegExp('thang\\.\\*\\+\\?\\^\\$\\(\\)\\[\\]', 'i')
    execMock.mockResolvedValue([{ name: 'thang.*+?^$()[]' }])

    await search(Model, req, res)

    expect(Model.find).toHaveBeenCalledWith({
      $or: [{ name: { $regex: escapedRegex } }],
    })

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    )
  })
})