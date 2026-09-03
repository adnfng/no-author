import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const COUNTER_KEY = 'no-author:fixed-commits'

export async function incrementTotal() {
  return Number(await redis.incr(COUNTER_KEY))
}

export async function getTotal() {
  return Number((await redis.get(COUNTER_KEY)) || 0)
}
