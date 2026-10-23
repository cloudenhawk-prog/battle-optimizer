// Highlights numbers, % and / in description text with the element color
import { Fragment } from 'react'

/**
 * Wraps numbers, %, and / in colored spans for inline description text.
 * Decimal separators (. or ,) are only colored when part of a number (e.g. 12.00 → whole thing colored).
 */
export function colorizeText(text: string, elColor: string) {
  const pattern = /(\d+(?:[.,]\d+)*|[%/])/g
  const parts: Array<string | ReturnType<typeof Fragment>> = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    parts.push(
      <span key={match.index} style={{ color: `hsl(${elColor})`, fontWeight: 600 }}>
        {match[0]}
      </span>,
    )
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return <>{parts}</>
}
