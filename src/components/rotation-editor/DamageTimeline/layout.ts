// Damage timeline geometry: time/value → SVG coordinates, swimlane heights/offsets and axis ticks.
import type { Owner } from './types'
import {
  CHART_HEIGHT, CHART_PADDING_BOTTOM, CHART_PADDING_LEFT, CHART_PADDING_TOP,
  SWIMLANE_HEIGHT, USABLE_HEIGHT, USABLE_WIDTH,
} from './constants'

// ========== Scales ===========================================================================================================

// maxTime / maxValue are always ≥ 1 (see buildTimelineData), so neither scale divides by zero
export function timeToX(t: number, maxTime: number): number {
  return CHART_PADDING_LEFT + (t / maxTime) * USABLE_WIDTH
}

export function valueToY(v: number, maxValue: number): number {
  return CHART_HEIGHT - CHART_PADDING_BOTTOM - (v / maxValue) * USABLE_HEIGHT
}

// ========== Swimlanes ========================================================================================================

/** Lane height grows by 20px per extra sub-lane (not 1:1 with the base height, to stay compact). */
export function swimlaneHeight(maxSubLanesByOwner: Map<string, number>, ownerName: string): number {
  const subLanes = maxSubLanesByOwner?.get(ownerName) || 1
  return SWIMLANE_HEIGHT + (subLanes - 1) * 20
}

/** Top Y of the owner's swimlane: lanes stack from CHART_PADDING_TOP in owner order. */
export function swimlaneY(owners: Owner[], maxSubLanesByOwner: Map<string, number>, ownerIndex: number): number {
  let y = CHART_PADDING_TOP
  for (let i = 0; i < ownerIndex; i++) {
    y += swimlaneHeight(maxSubLanesByOwner, owners[i].name)
  }
  return y
}

// ========== Ticks ============================================================================================================

/** Six evenly spaced value ticks (0 … maxValue). */
export function buildYTicks(maxValue: number, toY: (v: number) => number): { value: number; y: number }[] {
  const count = 5
  return Array.from({ length: count + 1 }, (_, i) => {
    const value = (maxValue / count) * i
    return { value, y: toY(value) }
  })
}

/** Whole-second time ticks, roughly 10 across the axis. */
export function buildXTicks(maxTime: number, toX: (t: number) => number): { time: number; x: number }[] {
  const step = Math.max(1, Math.ceil(maxTime / 10))
  const ticks: { time: number; x: number }[] = []
  for (let t = 0; t <= maxTime; t += step) {
    ticks.push({ time: t, x: toX(t) })
  }
  return ticks
}
