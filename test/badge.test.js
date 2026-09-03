const test = require('node:test')
const assert = require('node:assert/strict')

test('renders the global counter as an accessible SVG badge', async () => {
  const { badgeSvg } = await import('../server/lib/badge.js')
  const badge = badgeSvg(1234)

  assert.match(
    badge,
    /aria-label="no-author: 1,234 co-authors removed"/,
  )
  assert.match(badge, />1,234 removed</)
  assert.match(badge, /fill="#ff6b78"/)
  assert.match(badge, /^<svg/)
})
