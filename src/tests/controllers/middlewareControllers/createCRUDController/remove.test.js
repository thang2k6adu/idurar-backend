// Test case 1: mark document as removed
// Test case 2: return 404 if document not found or already removed
import { remove } from '~/controllers/middlewareControllers/createCRUDController/remove'

describe('remove controller (soft delete)', () => {
  let req, res, Model, execMock

  beforeEach(() => {
    req = {
      params: {
        id: '64c9df2f0c6a4c1a6e1b2a99',
      },
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    execMock = jest.fn()
    Model = {
      findOneAndUpdate: jest.fn().mockReturnValue({ exec: execMock }),
    }
  })

  it('TC1: should return 200 and mark document as removed', async () => {
    const mockDoc = { _id: req.params.id, removed: true, name: 'John Doe' }

    execMock.mockResolvedValue(mockDoc)

    await remove(Model, req, res)

    expect(Model.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: req.params.id, removed: false },
      { $set: { removed: true } },
      { new: true }
    )

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockDoc,
      message: 'Document removed successfully',
    })
  })

  it('TC2: should return 404 if document not found or already removed', async () => {
    execMock.mockResolvedValue(null)

    await remove(Model, req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Document not found',
    })
  })
})
