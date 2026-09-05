const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { loadSecrets, secretKeys } = require('./entrypoint.cjs')

function directory(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'regular-notes-secrets-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  return dir
}

test('generates private secrets and reuses them across starts', t => {
  const dir = directory(t)
  const first = {}
  loadSecrets(dir, first)
  const second = {}
  loadSecrets(dir, second)
  assert.deepEqual(second, first)
  assert.equal(new Set(Object.values(first)).size, secretKeys.length)
  assert.equal(fs.statSync(path.join(dir, 'secrets.json')).mode & 0o777, 0o600)
})

test('migrates existing keys without rotation, retaining U2F configuration', t => {
  const dir = directory(t)
  fs.mkdirSync(path.join(dir, 'database'))
  fs.writeFileSync(path.join(dir, 'database', 'home_server.sqlite'), '')
  const existing = Object.fromEntries(secretKeys.map(key => [key, `existing-${key}`]))
  const env = { ...existing, U2F_RELYING_PARTY_ID: 'notes.example.com' }
  loadSecrets(dir, env)
  const restarted = {}
  loadSecrets(dir, restarted)
  assert.deepEqual(restarted, existing)
  assert.equal(env.U2F_RELYING_PARTY_ID, 'notes.example.com')
  assert.throws(() => loadSecrets(dir, { JWT_SECRET: 'different' }), /differs/)
})

test('refuses to generate replacement keys for an existing database', t => {
  const dir = directory(t)
  fs.mkdirSync(path.join(dir, 'database'))
  fs.writeFileSync(path.join(dir, 'database', 'home_server.sqlite'), '')
  assert.throws(() => loadSecrets(dir, {}), /original secrets/)
  assert.equal(fs.existsSync(path.join(dir, 'secrets.json')), false)
})

test('does not expose malformed secret content in errors', t => {
  const dir = directory(t)
  fs.writeFileSync(path.join(dir, 'secrets.json'), 'private-secret-material')
  assert.throws(() => loadSecrets(dir, {}), error => !error.message.includes('private-secret-material'))
})
