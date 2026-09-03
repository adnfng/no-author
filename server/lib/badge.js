export function badgeSvg(count) {
  const value = `${count.toLocaleString('en-US')} fixed`
  const labelWidth = 80
  const valueWidth = Math.max(64, value.length * 7 + 14)
  const width = labelWidth + valueWidth
  const valueCenter = labelWidth + valueWidth / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="no-author: ${value}">
  <title>no-author: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${width}" height="20" rx="3"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="#007347"/>
    <rect width="${width}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Arial,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">no-author</text>
    <text x="${labelWidth / 2}" y="14">no-author</text>
    <text x="${valueCenter}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${valueCenter}" y="14">${value}</text>
  </g>
</svg>
`
}
