// Damage timeline constants: SVG chart/swimlane dimensions, owner colors and number formatting.

// ========== Chart Dimensions =================================================================================================

export const CHART_WIDTH = 1000 // SVG viewBox width; the SVG scales to the container (preserveAspectRatio="none")
export const CHART_HEIGHT = 400
export const CHART_PADDING_TOP = 60
export const CHART_PADDING_BOTTOM = 80
export const CHART_PADDING_LEFT = 80
export const CHART_PADDING_RIGHT = 40
export const USABLE_HEIGHT = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM
export const USABLE_WIDTH = CHART_WIDTH - CHART_PADDING_LEFT - CHART_PADDING_RIGHT

// ========== Swimlanes ========================================================================================================

// Swimlane configuration for character-based visualization
export const SWIMLANE_HEIGHT = 60
export const SWIMLANE_PADDING = 8

// Buff/debuff section rows
export const BUFF_LANE_HEIGHT = 24
export const BUFF_SECTION_SPACING = 8

// ========== Colors ===========================================================================================================

// Character color mapping for OWNERS (characters not listed fall back to the neutral color)
export const CHARACTER_COLORS: Record<string, string> = {
  Yangyang: '#4ade80',
  Cartethyia: '#f87171',
  Verina: '#60a5fa',
  Jiyan: '#a78bfa',
  Calcharo: '#fbbf24',
}

// Neutral color for global/system damage sources
export const GLOBAL_COLOR = '#94a3b8'

export function getOwnerColor(owner: string): string {
  return CHARACTER_COLORS[owner] || GLOBAL_COLOR
}

// ========== Formatting =======================================================================================================

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return Math.round(n).toString()
}
