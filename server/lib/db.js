import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const COUNTER_KEY = 'no-author:fixed-commits'
const EVENT_TTL_SECONDS = 60 * 60 * 24 * 90

const RECORD_EVENT = `
  local inserted = redis.call(
    "SET",
    KEYS[1],
    ARGV[1],
    "NX",
    "EX",
    ARGV[2]
  )

  if inserted then
    local total = redis.call("INCR", KEYS[2])
    return {1, total}
  end

  local total = tonumber(redis.call("GET", KEYS[2]) or "0")
  return {0, total}
`

export async function recordEvent(eventId, version) {
  const [counted, total] = await redis.eval(
    RECORD_EVENT,
    [`no-author:event:${eventId}`, COUNTER_KEY],
    [version, EVENT_TTL_SECONDS],
  )

  return {
    counted: Number(counted) === 1,
    total: Number(total),
  }
}

export async function getTotal() {
  return Number((await redis.get(COUNTER_KEY)) || 0)
}
