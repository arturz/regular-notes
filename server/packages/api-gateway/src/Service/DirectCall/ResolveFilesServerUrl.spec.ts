import { Request } from 'express'

import { resolveFilesServerUrl } from './ResolveFilesServerUrl'

describe('resolveFilesServerUrl', () => {
  it('should prefer an explicitly configured URL', () => {
    const request = {} as Request

    expect(resolveFilesServerUrl(request, 'https://files.example.test')).toBe('https://files.example.test')
  })

  it('should derive the public origin from reverse-proxy headers', () => {
    const request = {
      headers: {
        'x-forwarded-host': 'notes.example.test',
        'x-forwarded-proto': 'https',
      },
      get: jest.fn(),
      protocol: 'http',
    } as unknown as Request

    expect(resolveFilesServerUrl(request, '')).toBe('https://notes.example.test')
  })

  it('should fall back to the direct request origin', () => {
    const request = {
      headers: {},
      get: jest.fn().mockReturnValue('127.0.0.1:3000'),
      protocol: 'http',
    } as unknown as Request

    expect(resolveFilesServerUrl(request, '')).toBe('http://127.0.0.1:3000')
  })

  it('should reject malformed forwarded hosts', () => {
    const request = {
      headers: {
        'x-forwarded-host': 'notes.example.test/redirect',
        'x-forwarded-proto': 'https',
      },
      get: jest.fn(),
      protocol: 'http',
    } as unknown as Request

    expect(resolveFilesServerUrl(request, '')).toBe('')
  })
})
