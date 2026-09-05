'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { randomBytes } = require('node:crypto')

const secretKeys = ['JWT_SECRET', 'AUTH_JWT_SECRET', 'ENCRYPTION_SERVER_KEY', 'PSEUDO_KEY_PARAMS_KEY', 'VALET_TOKEN_SECRET']

function loadSecrets(dataDir, env) {
  const target = path.join(dataDir, 'secrets.json')
  if (!fs.existsSync(target)) {
    if (fs.existsSync(path.join(dataDir, 'database', 'home_server.sqlite')) && secretKeys.some(key => !env[key])) {
      throw new Error('Existing database: provide all original secrets in .env before first startup.')
    }
    const secrets = Object.fromEntries(secretKeys.map(key => [key, env[key] || randomBytes(32).toString('hex')]))
    const temporary = `${target}.${process.pid}.${randomBytes(8).toString('hex')}.tmp`
    try {
      fs.writeFileSync(temporary, JSON.stringify(secrets) + '\n', { mode: 0o600, flag: 'wx' })
      try {
        fs.linkSync(temporary, target)
      } catch (error) {
        if (error.code !== 'EEXIST') throw error
      }
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary)
    }
  }
  let secrets
  try {
    secrets = JSON.parse(fs.readFileSync(target, 'utf8'))
  } catch {
    throw new Error('Cannot read saved secrets.json; restore it from backup.')
  }
  if (!secrets || typeof secrets !== 'object') throw new Error('Invalid saved secrets.json')
  for (const key of secretKeys) {
    if (typeof secrets[key] !== 'string' || !secrets[key]) throw new Error(`Missing saved secret: ${key}`)
    if (env[key] && env[key] !== secrets[key]) throw new Error(`Secret differs from saved value: ${key}`)
  }
  fs.chmodSync(target, 0o600)
  for (const key of secretKeys) env[key] = secrets[key]
}

if (require.main === module) {
  try {
    const dataDir = process.env.DATA_DIR || '/data'
    fs.mkdirSync(dataDir, { recursive: true })
    const directories = [dataDir, path.join(dataDir, 'database'), path.join(dataDir, 'uploads')]
    if (process.getuid() === 0) {
      for (const directory of directories) {
        if (fs.existsSync(directory)) fs.chownSync(directory, 1000, 1000)
      }
    }
    if (process.getuid() === 0) {
      process.setgroups([])
      process.setgid(1000)
      process.setuid(1000)
    }
    for (const directory of directories) fs.mkdirSync(directory, { recursive: true })
    loadSecrets(dataDir, process.env)
    process.execve(process.execPath, [process.execPath, ...process.argv.slice(2)], process.env)
  } catch (error) {
    // Do not print configuration contents or secret values.
    console.error(`Startup failed: ${error.message}`)
    process.exitCode = 1
  }
}

module.exports = { loadSecrets, secretKeys }
