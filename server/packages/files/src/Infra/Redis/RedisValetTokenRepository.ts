import * as IORedis from 'ioredis'

import { ValetTokenRepositoryInterface } from '../../Domain/ValetToken/ValetTokenRepositoryInterface'

export class RedisValetTokenRepository implements ValetTokenRepositoryInterface {
  private readonly VALET_TOKEN_PREFIX = 'vt'

  constructor(
    private redisClient: IORedis.Redis,
    private retentionPeriodInSeconds = 60 * 60 * 24,
  ) {}

  async consume(valetToken: string): Promise<boolean> {
    const result = await this.redisClient.set(
      `${this.VALET_TOKEN_PREFIX}:${valetToken}`,
      'used',
      'EX',
      this.retentionPeriodInSeconds,
      'NX',
    )

    return result === 'OK'
  }

  async isUsed(valetToken: string): Promise<boolean> {
    return (await this.redisClient.get(`${this.VALET_TOKEN_PREFIX}:${valetToken}`)) === 'used'
  }
}
