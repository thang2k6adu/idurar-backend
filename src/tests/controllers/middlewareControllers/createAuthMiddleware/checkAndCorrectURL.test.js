import { checkAndCorrectURL } from '~/controllers/middlewareControllers/createAuthMiddleware/checkAndCorrectURL' // thay 'your-file' bằng tên file thật

describe('checkAndCorrectURL', () => {
  it('should add http:// if protocol is missing', () => {
    const result = checkAndCorrectURL('example.com')
    expect(result).toBe('http://example.com')
  })

  it('should keep https:// if present', () => {
    const result = checkAndCorrectURL('https://example.com')
    expect(result).toBe('https://example.com')
  })

  it('should keep http:// if present', () => {
    const result = checkAndCorrectURL('http://example.com')
    expect(result).toBe('http://example.com')
  })

  it('should remove multiple trailing slashes', () => {
    const result = checkAndCorrectURL('http://example.com///')
    expect(result).toBe('http://example.com')
  })

  it('should remove protocol and re-add correctly for https', () => {
    const result = checkAndCorrectURL('https://example.com/')
    expect(result).toBe('https://example.com')
  })

  it('should handle URLs with paths correctly', () => {
    const result = checkAndCorrectURL('https://example.com/path/')
    expect(result).toBe('https://example.com/path')
  })

  it('should default to http if protocol is not https', () => {
    const result = checkAndCorrectURL('ftp://example.com')
    expect(result).toBe('http://ftp://example.com') // not ideal, but matches current logic
  })
})
