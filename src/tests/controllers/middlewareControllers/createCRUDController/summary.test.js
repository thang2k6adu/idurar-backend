// Test case 1: return total counts with no filter
// Test case 2: apply filter and equal when provided
// Test case 3: return 0 if no documents found
import { summary } from '~/controllers/middlewareControllers/createCRUDController/summary'

describe('summary controller', () => {
  let req, res, Model

  beforeEach(() => {
    req = {
      query: {},
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    Model = {
      countDocuments: jest.fn(),
    }
  })

  it('should return 200 with total and filtered count (no filter provided)', async () => {
    Model.countDocuments
      .mockResolvedValueOnce(10) // countAllDocuments
      .mockResolvedValueOnce(10) // countDocumentsByFilter (same as above)

    await summary(Model, req, res)

    expect(Model.countDocuments).toHaveBeenCalledWith({ removed: false })
    expect(Model.countDocuments).toHaveBeenCalledTimes(2)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: {
        countAllDocuments: 10,
        countDocumentsByFilter: 10,
      },
      message: 'Successfully count all documents',
    })
  })

  it('should apply filter and return correct counts', async () => {
    req.query = {
      filter: 'status',
      equal: 'active',
    }

    Model.countDocuments
      .mockResolvedValueOnce(50) // all
      .mockResolvedValueOnce(15) // filtered

    await summary(Model, req, res)

    expect(Model.countDocuments).toHaveBeenNthCalledWith(1, { removed: false })
    expect(Model.countDocuments).toHaveBeenNthCalledWith(2, {
      removed: false,
      status: 'active',
    })

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: {
        countAllDocuments: 50,
        countDocumentsByFilter: 15,
      },
      message: 'Successfully count all documents',
    })
  })

  it('should return message for no documents found', async () => {
    Model.countDocuments
      .mockResolvedValueOnce(0) // all
      .mockResolvedValueOnce(0) // filtered

    await summary(Model, req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: {
        countAllDocuments: 0,
        countDocumentsByFilter: 0,
      },
      message: 'No documents found by this request',
    })
  })
})
