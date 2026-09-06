import { CookieFactory } from './CookieFactory'

describe('CookieFactory', () => {
  const expiration = new Date('2126-01-01T00:00:00.000Z')

  it('should create host-only cookies when no domain is configured', () => {
    const factory = new CookieFactory('Lax', undefined, true, false)

    const cookies = factory.createCookieHeaderValue({
      sessionUuid: 'session',
      accessToken: 'access',
      refreshToken: 'refresh',
      refreshTokenExpiration: expiration,
    })

    expect(cookies).toHaveLength(2)
    expect(cookies.every((cookie) => !cookie.includes('Domain='))).toBe(true)
  })

  it('should preserve an explicitly configured cookie domain', () => {
    const factory = new CookieFactory('None', 'notes.example.test', true, true)

    const cookies = factory.createCookieHeaderValue({
      sessionUuid: 'session',
      accessToken: 'access',
      refreshToken: 'refresh',
      refreshTokenExpiration: expiration,
    })

    expect(cookies.every((cookie) => cookie.includes('Domain=notes.example.test'))).toBe(true)
  })

  it('should omit the secure attribute when the factory is not secure', () => {
    const factory = new CookieFactory('Lax', undefined, false, false)

    const cookies = factory.createCookieHeaderValue({
      sessionUuid: 'session',
      accessToken: 'access',
      refreshToken: 'refresh',
      refreshTokenExpiration: expiration,
    })

    expect(cookies).toHaveLength(2)
    expect(cookies.every((cookie) => !cookie.includes('Secure'))).toBe(true)
  })
})
