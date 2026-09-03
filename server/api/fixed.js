import { recordEvent } from '../lib/db.js'

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const VERSION = /^[0-9A-Za-z.+-]{1,32}$/

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  if (Number(request.headers['content-length'] || 0) > 1024) {
    return response.status(413).json({ error: 'Payload too large' })
  }

  let body
  try {
    body =
      typeof request.body === 'string' ? JSON.parse(request.body) : request.body
  } catch {
    return response.status(400).json({ error: 'Invalid JSON' })
  }
  const eventId = body?.eventId
  const version = body?.version

  if (!UUID.test(eventId) || !VERSION.test(version)) {
    return response.status(400).json({ error: 'Invalid event' })
  }

  const result = await recordEvent(eventId, version)

  return response.status(result.counted ? 201 : 200).json(result)
}
