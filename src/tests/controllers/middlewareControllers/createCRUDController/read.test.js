// Test case 1: return document when found
// Test case 2: return 404 when document not found
import { read } from '~/controllers/middlewareControllers/createCRUDController/read'

describe('read controller', () => {
  let req, res, Model, execMock

  beforeEach(() => {
    req = { params: { id: '64c9df2f0c6a4c1a6e1b2a99' } }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    execMock = jest.fn()
    Model = {
      findOne: jest.fn().mockReturnValue({ exec: execMock }),
    }
  })

  it('should return 200 and document when found', async () => {
    const mockDoc = { _id: req.params.id, name: 'Test User', removed: false }
    execMock.mockResolvedValue(mockDoc)

    await read(Model, req, res)

    expect(Model.findOne).toHaveBeenCalledWith({
      _id: req.params.id,
      removed: false,
    })

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockDoc,
      message: 'Get document successfully',
    })
  })

  it('should return 404 when document not found', async () => {
    execMock.mockResolvedValue(null)

    await read(Model, req, res)

    expect(Model.findOne).toHaveBeenCalledWith({
      _id: req.params.id,
      removed: false,
    })

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'No document found',
    })
  })
})
