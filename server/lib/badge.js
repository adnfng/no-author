export function badgeSvg(count) {
  const number = count.toLocaleString('en-US')
  const value = `${number} removed`
  const width = Math.max(176, 112 + value.length * 7)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28" role="img" aria-label="no-author: ${number} co-authors removed">
  <title>no-author: ${number} co-authors removed</title>
  <rect x=".5" y=".5" width="${width - 1}" height="27" rx="8" fill="#20201f" stroke="#383836"/>
  <path d="M88 7v14" stroke="#383836"/>
  <g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="11">
    <text x="13" y="18" fill="#a6a6a2">no-author</text>
    <text x="${width - 13}" y="18" fill="#ff6b78" text-anchor="end" font-weight="600">${value}</text>
  </g>
</svg>
`
}
