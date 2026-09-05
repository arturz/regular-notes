import { Request } from 'express'

export function resolveFilesServerUrl(request: Request, configuredFilesServerUrl: string): string {
  if (configuredFilesServerUrl) {
    return configuredFilesServerUrl
  }

  const forwardedHost = firstHeaderValue(request.headers['x-forwarded-host'])
  const host = forwardedHost ?? request.get('host')
  if (!host || !/^[a-zA-Z0-9._:[\]-]+$/.test(host)) {
    return ''
  }

  const forwardedProtocol = firstHeaderValue(request.headers['x-forwarded-proto'])
  const protocol = forwardedProtocol === 'http' || forwardedProtocol === 'https' ? forwardedProtocol : request.protocol
  if (protocol !== 'http' && protocol !== 'https') {
    return ''
  }

  return `${protocol}://${host}`
}

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  const firstValue = Array.isArray(value) ? value[0] : value?.split(',')[0]

  return firstValue?.trim()
}
