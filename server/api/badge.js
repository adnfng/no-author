import { badgeSvg } from '../lib/badge.js'
import { getTotal } from '../lib/db.js'

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).send('Method not allowed')
  }

  const fixedCommits = await getTotal()

  response.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  return response.status(200).send(badgeSvg(fixedCommits))
}
