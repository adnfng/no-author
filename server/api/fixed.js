import { incrementTotal } from '../lib/db.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const total = await incrementTotal()

  return response.status(201).json({ fixedCommits: total })
}
