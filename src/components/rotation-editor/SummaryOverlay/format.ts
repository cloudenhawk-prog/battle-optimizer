// Number/time formatting and asset-path helpers shared by the summary panels

export function formatDamage(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return value.toFixed(0)
}

export function formatTime(seconds: number): string {
  if (seconds < 0.01) return '0s'
  return `${seconds.toFixed(2)}s`
}

/** Modifier icon path derived from its display name ("Foo: Bar Baz" → foo_bar_baz.png). */
export function buffIconPath(displayName: string): string {
  return `/assets/modifiers/${displayName.toLowerCase().replace(/:/g, '').replace(/\s+/g, '_')}.png`
}
