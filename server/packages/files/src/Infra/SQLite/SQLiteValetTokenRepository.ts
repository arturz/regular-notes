import { createHash } from 'crypto'
import { Database, RunResult } from 'sqlite3'
import { TimerInterface } from '@standardnotes/time'

import { ValetTokenRepositoryInterface } from '../../Domain/ValetToken/ValetTokenRepositoryInterface'

export class SQLiteValetTokenRepository implements ValetTokenRepositoryInterface {
  private readonly database: Database
  private readonly initialization: Promise<void>

  constructor(
    databasePath: string,
    private timer: TimerInterface,
    private retentionPeriodInSeconds = 60 * 60 * 24,
  ) {
    this.database = new Database(databasePath)
    this.initialization = this.initialize()
  }

  async consume(valetToken: string): Promise<boolean> {
    await this.initialization

    const now = this.timer.getTimestampInSeconds()
    await this.run('DELETE FROM used_valet_tokens WHERE expires_at <= ?', [now])

    const changes = await this.run(
      'INSERT OR IGNORE INTO used_valet_tokens (token_hash, expires_at) VALUES (?, ?)',
      [this.hash(valetToken), now + this.retentionPeriodInSeconds],
    )

    return changes === 1
  }

  async isUsed(valetToken: string): Promise<boolean> {
    await this.initialization

    return await new Promise<boolean>((resolve, reject) => {
      this.database.get(
        'SELECT 1 AS present FROM used_valet_tokens WHERE token_hash = ? AND expires_at > ?',
        [this.hash(valetToken), this.timer.getTimestampInSeconds()],
        (error: Error | null, row: { present: number } | undefined) => {
          if (error) {
            reject(error)
          } else {
            resolve(row?.present === 1)
          }
        },
      )
    })
  }

  async close(): Promise<void> {
    await this.initialization

    return await new Promise<void>((resolve, reject) => {
      this.database.close((error: Error | null) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  private async initialize(): Promise<void> {
    await this.run('PRAGMA journal_mode = WAL')
    await this.run('PRAGMA busy_timeout = 2000')
    await this.run(
      `CREATE TABLE IF NOT EXISTS used_valet_tokens (
        token_hash BLOB PRIMARY KEY NOT NULL CHECK(length(token_hash) = 32),
        expires_at INTEGER NOT NULL
      )`,
    )
    await this.run('CREATE INDEX IF NOT EXISTS used_valet_tokens_expires_at ON used_valet_tokens (expires_at)')
    await this.run('DELETE FROM used_valet_tokens WHERE expires_at <= ?', [this.timer.getTimestampInSeconds()])
  }

  private run(sql: string, parameters: unknown[] = []): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.database.run(sql, parameters, function (this: RunResult, error: Error | null): void {
        if (error) {
          reject(error)
        } else {
          resolve(this.changes)
        }
      })
    })
  }

  private hash(valetToken: string): Buffer {
    return createHash('sha256').update(valetToken).digest()
  }
}
