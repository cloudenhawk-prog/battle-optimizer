// Inline-style helper that re-tints every ui-* primitive inside an element

/** `raw` is a space-separated HSL triplet such as '200 100% 70%'. */
export function accentVar(raw: string): React.CSSProperties {
  return { '--ui-accent-raw': raw } as React.CSSProperties
}
