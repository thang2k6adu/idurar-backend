// Test case 1: return 200 and updated document when found
// Test case 2: return 404 when document not found
// Test case 3: override removed field to false
import { update } from '~/controllers/middlewareControllers/createCRUDController/update'

describe('update controller', () => {
  let req, res, Model, execMock

  beforeEach(() => {
    req = {
      params: { id: '64c9df2f0c6a4c1a6e1b2a99' },
      body: { name: 'Updated Name', removed: true }, // removed sẽ bị ghi đè
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    execMock = jest.fn()
    Model = {
      findOneAndUpdate: jest.fn(),
    }
  })

  it('should return 200 and updated document when found', async () => {
    const updatedDoc = {
      _id: req.params.id,
      name: 'Updated Name',
      removed: false,
    }

    Model.findOneAndUpdate.mockResolvedValue(updatedDoc)

    await update(Model, req, res)

    expect(Model.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: req.params.id,
        removed: false,
      },
      {
        ...req.body,
        removed: false, // override
      },
      {
        new: true,
        runValidators: true,
      }
    )

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: updatedDoc,
      message: 'Document update successfully',
    })
  })

  it('should return 404 when document not found', async () => {
    Model.findOneAndUpdate.mockResolvedValue(null)

    await update(Model, req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Document not found',
    })
  })

  it('should override removed field to false', async () => {
    Model.findOneAndUpdate.mockResolvedValue({})

    await update(Model, req, res)

    // removed must be forced to false regardless of user input
    expect(req.body.removed).toBe(false)
  })
})
