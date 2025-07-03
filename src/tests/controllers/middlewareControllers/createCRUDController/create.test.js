import { create } from '~/controllers/middlewareControllers/createCRUDController/create'

describe('create controller', () => {
  // Test case 1: Should create a new document and return success response
  it('should create a new document and return success response', async () => {
    // Fake request + response
    const req = {
      body: {
        name: 'Test Name',
        age: 25,
      },
    }

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Fake result that .save() will return
    const fakeResult = {
      _id: '123',
      name: 'Test Name',
      age: 25,
      removed: false,
    }

    // Mock Mongoose Model and .save()
    const saveMock = jest.fn().mockResolvedValue(fakeResult)
    const ModelMock = jest.fn(() => ({
      save: saveMock,
    }))

    // Call the function
    await create(ModelMock, req, res)

    // Assertions
    expect(req.body.removed).toBe(false)
    expect(ModelMock).toHaveBeenCalledWith({
      name: 'Test Name',
      age: 25,
      removed: false,
    })
    expect(saveMock).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: fakeResult,
      message: 'Successfully created the document in model',
    })
  })
})
