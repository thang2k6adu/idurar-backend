// Test case 1: Return an error when filter or equal is missing
// Test case 2: Return 'No document found' when there is no result
// Test case 3: Return success when there is a result from the database
// Test case 4: Ensure where() and equals() are called correctly
import { filter } from '~/controllers/middlewareControllers/createCRUDController/filter'

describe('filter controller', () => {
  let req, res

  beforeEach(() => {
    req = {
      query: {}
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
  })

  // Test case 1: Return an error when filter or equal is missing
  it('should return 400 if filter or equal is missing', async () => {
    req.query = {} // missing filter and equal

    await filter(null, req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Filter and equal are required',
    })
  })

  it('should return 200 with "No document found" if result is empty', async () => {
    req.query = { filter: 'role', equal: 'admin' }

    // Mock Model chainable query: find().where().equals().exec()
    const execMock = jest.fn().mockResolvedValue([])
    const equalsMock = jest.fn(() => ({ exec: execMock }))
    const whereMock = jest.fn(() => ({ equals: equalsMock }))
    const findMock = jest.fn(() => ({ where: whereMock }))

    const Model = {
      find: findMock
    }

    await filter(Model, req, res)

    expect(findMock).toHaveBeenCalledWith({ removed: false })
    expect(whereMock).toHaveBeenCalledWith('role')
    expect(equalsMock).toHaveBeenCalledWith('admin')
    expect(execMock).toHaveBeenCalled()

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'No document found',
    })
  })

  it('should return 200 with result when documents found', async () => {
    req.query = { filter: 'role', equal: 'admin' }
    const fakeResult = [{ _id: '1', role: 'admin' }]

    const execMock = jest.fn().mockResolvedValue(fakeResult)
    const equalsMock = jest.fn(() => ({ exec: execMock }))
    const whereMock = jest.fn(() => ({ equals: equalsMock }))
    const findMock = jest.fn(() => ({ where: whereMock }))

    const Model = {
      find: findMock
    }

    await filter(Model, req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: fakeResult,
      message: 'Successfully filtered the documents',
    })
  })
})
