import { TimerInterface } from '@standardnotes/time'

import { SQLiteValetTokenRepository } from './SQLiteValetTokenRepository'

describe('SQLiteValetTokenRepository', () => {
  let timer: TimerInterface
  let repository: SQLiteValetTokenRepository

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInSeconds = jest.fn().mockReturnValue(100)
    repository = new SQLiteValetTokenRepository(':memory:', timer)
  })

  afterEach(async () => {
    await repository.close()
  })

  it('should consume a token only once', async () => {
    await expect(repository.consume('secret-token')).resolves.toBe(true)
    await expect(repository.isUsed('secret-token')).resolves.toBe(true)
    await expect(repository.consume('secret-token')).resolves.toBe(false)
  })

  it('should allow only one concurrent consumer', async () => {
    const results = await Promise.all([
      repository.consume('secret-token'),
      repository.consume('secret-token'),
      repository.consume('secret-token'),
    ])

    expect(results.filter(Boolean)).toHaveLength(1)
  })

  it('should discard expired token records', async () => {
    await repository.consume('secret-token')
    timer.getTimestampInSeconds = jest.fn().mockReturnValue(86501)

    await expect(repository.isUsed('secret-token')).resolves.toBe(false)
    await expect(repository.consume('secret-token')).resolves.toBe(true)
  })

  it('should honor a configured retention period longer than one day', async () => {
    await repository.close()
    repository = new SQLiteValetTokenRepository(':memory:', timer, 200000)

    await repository.consume('secret-token')
    timer.getTimestampInSeconds = jest.fn().mockReturnValue(100000)

    await expect(repository.isUsed('secret-token')).resolves.toBe(true)
    await expect(repository.consume('secret-token')).resolves.toBe(false)
  })

  it('should propagate database errors when consuming a token on a closed database', async () => {
    await repository.close()

    await expect(repository.consume('secret-token')).rejects.toThrow()

    repository = new SQLiteValetTokenRepository(':memory:', timer)
  })

  it('should propagate database errors when checking a token on a closed database', async () => {
    await repository.close()

    await expect(repository.isUsed('secret-token')).rejects.toThrow()

    repository = new SQLiteValetTokenRepository(':memory:', timer)
  })

  it('should propagate database errors when closing an already closed database', async () => {
    await repository.close()

    await expect(repository.close()).rejects.toThrow()

    repository = new SQLiteValetTokenRepository(':memory:', timer)
  })
})
