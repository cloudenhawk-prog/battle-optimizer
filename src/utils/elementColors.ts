// ========== Element Color Themes ============================================================================================
// Space-separated HSL values (no 'hsl()' wrapper) so they can be used inside hsl(var(--el-primary) / alpha) CSS expressions.

export type ElementTheme = {
  primary: string  // e.g. '160 80% 55%' — canonical (variant 0)
  bg: string       // dark background variant
  label: string
}

export const ELEMENT_THEMES: Record<string, ElementTheme> = {
  AERO:    { primary: '160 80% 55%', bg: '160 40% 8%', label: 'Aero' },
  SPECTRO: { primary: '45 100% 60%',  bg: '45 60% 8%',  label: 'Spectro' },
  HAVOC:   { primary: '270 80% 60%',  bg: '270 40% 8%', label: 'Havoc' },
  ELECTRO: { primary: '280 100% 65%', bg: '280 50% 8%', label: 'Electro' },
  GLACIO:  { primary: '200 100% 70%', bg: '200 50% 8%', label: 'Glacio' },
  FUSION:  { primary: '15 100% 55%',  bg: '15 50% 8%',  label: 'Fusion' },
}

// Three per-slot color variants per element.
// Each variant represents a distinct visual facet of the element's theme
// (e.g. Glacio = bright ice / deep arctic / pale frost crystal) so that
// even at the low alpha of a row tint the three are clearly different.
export const ELEMENT_PRIMARIES: Record<string, [string, string, string]> = {
  //            slot 0 — core           slot 1 — darker/deeper          slot 2 — lighter/alt-tint
  AERO:    ['160 85% 55%',  '135 75% 50%',   '192 88% 65%' ],  // teal  /  forest-green  /  sky-blue
  SPECTRO: ['45 100% 60%',  '52 100% 75%',   '30 100% 65%' ],  // gold  /  bright yellow  /  warm amber
  HAVOC:   ['272 80% 62%',  '248 78% 65%',   '298 74% 56%' ],  // purple  /  deep indigo  /  magenta
  ELECTRO: ['283 100% 65%', '260 90% 72%',   '312 88% 60%' ],  // electric-violet  /  neon-blue  /  hot-pink
  GLACIO:  ['195 100% 70%', '220 88% 60%',   '175 72% 78%' ],  // bright-ice-blue  /  arctic-navy  /  pale-frost
  FUSION:  ['15 100% 58%',  '0  95% 50%',    '40 100% 65%' ],  // orange-flame  /  red-ember  /  yellow-flare
}

const DEFAULT_PRIMARIES: [string, string, string] = ['210 15% 60%', '210 15% 60%', '210 15% 60%']

export const DEFAULT_ELEMENT_THEME: ElementTheme = {
  primary: '210 15% 60%',
  bg: '210 15% 8%',
  label: '',
}

export function getElementTheme(element?: string | null): ElementTheme {
  if (!element) return DEFAULT_ELEMENT_THEME
  return ELEMENT_THEMES[element.toUpperCase()] ?? DEFAULT_ELEMENT_THEME
}

/**
 * Returns the HSL primary string for the given element and team-slot index (0–2).
 * Use this wherever a character needs a unique color among team-mates of the same element.
 */
export function getElementPrimary(element: string | null | undefined, variantIdx: number): string {
  if (!element) return DEFAULT_PRIMARIES[0]
  const variants = ELEMENT_PRIMARIES[element.toUpperCase()] ?? DEFAULT_PRIMARIES
  return variants[Math.min(variantIdx, 2) as 0 | 1 | 2]
}
