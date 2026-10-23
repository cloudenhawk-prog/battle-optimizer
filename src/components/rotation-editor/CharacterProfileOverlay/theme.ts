// Element color themes, shared fonts/colors and asset-path helper for the character profile overlay

// ========== Element Theme ====================================================================================================

export type ElementTheme = { primary: string; bg: string; label: string }

const ELEMENT_THEMES: Record<string, ElementTheme> = {
  AERO: { primary: '160 80% 55%', bg: '160 40% 8%', label: 'Aero' },
  SPECTRO: { primary: '45 100% 60%', bg: '45 60% 8%', label: 'Spectro' },
  HAVOC: { primary: '270 80% 60%', bg: '270 40% 8%', label: 'Havoc' },
  ELECTRO: { primary: '280 100% 65%', bg: '280 50% 8%', label: 'Electro' },
  GLACIO: { primary: '200 100% 70%', bg: '200 50% 8%', label: 'Glacio' },
  FUSION: { primary: '15 100% 55%', bg: '15 50% 8%', label: 'Fusion' },
}

export function getTheme(element: string): ElementTheme {
  return ELEMENT_THEMES[element] ?? { primary: '220 15% 60%', bg: '220 15% 8%', label: element || '—' }
}

// ========== Shared Fonts & Colors =============================================================================================

export const MUTED = 'hsl(210 15% 50%)'
export const FONT_DISPLAY = '"Orbitron", sans-serif'
export const FONT_MONO = '"Share Tech Mono", monospace'
export const FONT_BODY = '"Rajdhani", "Segoe UI", sans-serif'

// ========== Asset Path Helper ================================================================================================

export function assetPath(path: string): string {
  return path.startsWith('/') ? path : '/' + path
}
