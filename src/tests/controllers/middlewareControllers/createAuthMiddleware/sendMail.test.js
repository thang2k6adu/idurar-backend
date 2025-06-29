// sendMail.test.js

import { sendMail } from '~/controllers/middlewareControllers/createAuthMiddleware/sendMail'
import { Resend } from 'resend'
import { emailVerification } from '~/emailTemplate/emailVerification'

// Mock Resend
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn(),
      },
    })),
  }
})

// Mock template
jest.mock('~/emailTemplate/emailVerification', () => ({
  emailVerification: jest.fn(() => '<html>Mock Email</html>'),
}))

describe('sendMail', () => {
  const mockSend = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    Resend.mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    }))
  })

  // check input data
  it('should send email using Resend and return response data', async () => {
    const mockData = {
      id: '12345678-abcd-efgh-ijkl-1234567890ab',
      created_at: new Date().toISOString(),
      to: ['user@example.com'],
      from: 'noreply@idurarapp.com',
      subject: 'Verify your email | IDURAR',
      html: '<html>Mock Email</html>',
    }

    mockSend.mockResolvedValue({ data: mockData })

    const result = await sendMail(
      'user@example.com',
      'Test User',
      'https://example.com/verify',
      'noreply@idurarapp.com'
    )

    expect(emailVerification).toHaveBeenCalledWith({
      name: 'Test User',
      link: 'https://example.com/verify',
    })

    expect(mockSend).toHaveBeenCalledWith({
      from: 'noreply@idurarapp.com',
      to: 'user@example.com',
      subject: 'Verify your email | IDURAR',
      html: '<html>Mock Email</html>',
    })

    expect(result).toEqual(mockData)
  })

  it('should use custom subject and type if provided', async () => {
    mockSend.mockResolvedValue({ data: { id: 'custom-id' } })

    await sendMail(
      'custom@example.com',
      'Custom Name',
      'https://custom.com/reset',
      'noreply@idurarapp.com',
      'Reset your password',
      'customType'
    )

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'custom@example.com',
        subject: 'Reset your password',
      })
    )
  })
})
