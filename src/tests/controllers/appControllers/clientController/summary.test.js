// test summary
// Test case 1: should return summary data with default type (month)
// Test case 2: should return summary data with week type
// Test case 3: should return summary data with year type
// Test case 4: should return 400 if type is invalid
// Test case 5: should handle empty aggregation results
// Test case 6: should handle zero total clients scenario
import { summary } from '~/controllers/appControllers/clientController/summary'
import mongoose from 'mongoose'

jest.mock('mongoose', () => ({
  model: jest.fn(),
}))

jest.mock('moment', () => {
  const m = () => m
  m.clone = () => m
  m.startOf = () => m
  m.endOf = () => m
  m.toDate = () => new Date('2024-01-15T10:00:00.000Z')
  return m
})

describe('clientController summary', () => {
  let req, res, aggregateMock, ModelMock, InvoiceModelMock

  beforeEach(() => {
    jest.clearAllMocks()
    req = { query: {} }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    aggregateMock = jest.fn()

    // Mock Client Model
    ModelMock = {
      aggregate: aggregateMock
    }

    // Mock Invoice Model
    InvoiceModelMock = {
      collection: { name: 'invoices' }
    }

    mongoose.model.mockImplementation((modelName) => {
      if (modelName === 'Invoice') return InvoiceModelMock
      return null
    })
  })

  it('Test case 1: should return summary data with default type (month)', async () => {
    // Mock aggregate for summary
    aggregateMock.mockResolvedValueOnce([
      {
        totalClients: [{ count: 100 }],
        newClients: [{ count: 15 }],
        activeClients: [{ count: 75 }],
      },
    ])

    await summary(ModelMock, req, res)

    expect(aggregateMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $facet: expect.objectContaining({
            totalClients: expect.any(Array),
            newClients: expect.any(Array),
            activeClients: expect.any(Array),
          }),
        }),
      ])
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: {
          new: 15, // 15% of 100
          active: 75, // 75% of 100
        },
        message: 'Successfully get summary of new clients',
      })
    )
  })

  it('Test case 2: should return summary data with week type', async () => {
    req.query = { type: 'week' }

    aggregateMock.mockResolvedValueOnce([
      {
        totalClients: [{ count: 50 }],
        newClients: [{ count: 8 }],
        activeClients: [{ count: 30 }],
      },
    ])

    await summary(ModelMock, req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: {
          new: 16, // 8% of 50 = 16%
          active: 60, // 30% of 50 = 60%
        },
        message: 'Successfully get summary of new clients',
      })
    )
  })

  it('Test case 3: should return summary data with year type', async () => {
    req.query = { type: 'year' }

    aggregateMock.mockResolvedValueOnce([
      {
        totalClients: [{ count: 200 }],
        newClients: [{ count: 40 }],
        activeClients: [{ count: 160 }],
      },
    ])

    await summary(ModelMock, req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: {
          new: 20, // 40% of 200 = 20%
          active: 80, // 160% of 200 = 80%
        },
        message: 'Successfully get summary of new clients',
      })
    )
  })

  it('Test case 4: should return 400 if type is invalid', async () => {
    req.query = { type: 'invalid' }

    await summary(ModelMock, req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        result: null,
        message: 'Invalid type',
      })
    )
  })

  it('Test case 5: should handle empty aggregation results', async () => {
    aggregateMock.mockResolvedValueOnce([
      {
        totalClients: [],
        newClients: [],
        activeClients: [],
      },
    ])

    await summary(ModelMock, req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: {
          new: 0,
          active: 0,
        },
        message: 'Successfully get summary of new clients',
      })
    )
  })

  it('Test case 6: should handle zero total clients scenario', async () => {
    aggregateMock.mockResolvedValueOnce([
      {
        totalClients: [{ count: 0 }],
        newClients: [{ count: 0 }],
        activeClients: [{ count: 0 }],
      },
    ])

    await summary(ModelMock, req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: {
          new: 0,
          active: 0,
        },
        message: 'Successfully get summary of new clients',
      })
    )
  })

  it('Test case 7: should handle partial aggregation results', async () => {
    aggregateMock.mockResolvedValueOnce([
      {
        totalClients: [{ count: 100 }],
        newClients: [],
        activeClients: [{ count: 50 }],
      },
    ])

    await summary(ModelMock, req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: {
          new: 0, // 0% of 100
          active: 50, // 50% of 100
        },
        message: 'Successfully get summary of new clients',
      })
    )
  })

  it('Test case 8: should verify aggregation pipeline structure', async () => {
    aggregateMock.mockResolvedValueOnce([
      {
        totalClients: [{ count: 10 }],
        newClients: [{ count: 2 }],
        activeClients: [{ count: 8 }],
      },
    ])

    await summary(ModelMock, req, res)

    const pipelineCall = aggregateMock.mock.calls[0][0][0]

    // Verify totalClients pipeline
    expect(pipelineCall.$facet.totalClients).toEqual([
      {
        $match: {
          removed: false,
          enabled: true,
        },
      },
      {
        $count: 'count',
      },
    ])

    // Verify newClients pipeline
    expect(pipelineCall.$facet.newClients).toEqual([
      {
        $match: {
          removed: false,
          created: {
            $gte: expect.any(Date),
            $lte: expect.any(Date),
          },
        },
      },
      {
        $count: 'count',
      },
    ])

    // Verify activeClients pipeline
    expect(pipelineCall.$facet.activeClients).toEqual([
      {
        $lookup: {
          from: 'invoices',
          localField: '_id',
          foreignField: 'client',
          as: 'invoice',
        },
      },
      {
        $match: {
          'invoice.removed': false,
        },
      },
      {
        $group: {
          _id: '$_id',
        },
      },
      {
        $count: 'count',
      },
    ])
  })
})
