// Pure damage math for the data overlay: per-mode event damage, totals, name/type aggregation and pie slice paths
import type { DamageEvent } from '../../../types/events'
import type { Snapshot } from '../../../types/snapshot'

/** Which damage figure the overlay displays. */
export type DamageMode = 'average' | 'normal' | 'crit'

// Pie chart colors — tuned to match the cyan/amber/purple palette of the SummaryOverlay
export const PIE_CHART_COLORS = [
  'rgba(100, 220, 255, 0.75)', // cyan
  'rgba(255, 190,  60, 0.75)', // amber
  'rgba(200, 120, 255, 0.75)', // violet
  'rgba(100, 220, 175, 0.75)', // teal
  'rgba(255, 130, 100, 0.75)', // coral
]

// ========== Event Damage ====================================================================================================

// Returns the appropriate damage value for a DamageEvent based on the selected mode.
// Negative status damage cannot crit — always uses normalStrike in crit mode.
export function getEventDamage(event: DamageEvent, mode: DamageMode): number {
  if (mode === 'average') return event.average
  if (mode === 'normal') return event.normalStrike
  if (event.dmgTypes.includes('NEGATIVE_STATUS')) return event.normalStrike
  return event.criticalStrike
}

export function calculateTotalDamage(damageEvents: DamageEvent[], mode: DamageMode): number {
  return damageEvents.reduce((sum, e) => sum + getEventDamage(e, mode), 0)
}

export function calculateDuration(snapshot: Snapshot): number {
  return snapshot.toTime - snapshot.fromTime
}

// ========== Aggregation =====================================================================================================

/** Groups events by action name, in first-seen order (list index doubles as colour + highlight id). */
export function aggregateEventsByName(damageEvents: DamageEvent[], mode: DamageMode): Array<{ name: string; damage: number; count: number; events: DamageEvent[] }> {
  const map = new Map<string, { damage: number; count: number; events: DamageEvent[] }>()

  for (const e of damageEvents) {
    const dmg = getEventDamage(e, mode)
    const existing = map.get(e.actionName)
    if (existing) {
      existing.damage += dmg
      existing.count++
      existing.events.push(e)
    } else {
      map.set(e.actionName, { damage: dmg, count: 1, events: [e] })
    }
  }

  return Array.from(map.entries()).map(([name, data]) => ({ name, ...data }))
}

/** Damage per dmgType, sorted desc. Multi-type events count fully towards each type, so types can sum past the total. */
export function aggregateDamageByType(damageEvents: DamageEvent[], mode: DamageMode): Array<{ name: string; damage: number; event?: DamageEvent }> {
  const typeMap = new Map<string, number>()

  damageEvents.forEach(event => {
    const dmg = getEventDamage(event, mode)
    event.dmgTypes.forEach(type => {
      const current = typeMap.get(type) || 0
      typeMap.set(type, current + dmg)
    })
  })

  return Array.from(typeMap.entries())
    .map(([type, damage]) => ({ name: type, damage }))
    .sort((a, b) => b.damage - a.damage)
}

// ========== Pie Slices ======================================================================================================

/** Classic pie wedges (centre 100,100, radius 90), starting at 12 o'clock and going clockwise. */
export function calculatePieSlices(damageValues: number[], colors: string[]) {
  const total = damageValues.reduce((sum, val) => sum + val, 0)
  let cumulativePercent = 0

  return damageValues.map((damage, index) => {
    const percent = (damage / total) * 100
    const angle = (percent / 100) * 360
    const startAngle = (cumulativePercent / 100) * 360
    const rad = (deg: number) => (deg * Math.PI) / 180

    const x1 = 100 + 90 * Math.cos(rad(startAngle - 90))
    const y1 = 100 + 90 * Math.sin(rad(startAngle - 90))
    const x2 = 100 + 90 * Math.cos(rad(startAngle + angle - 90))
    const y2 = 100 + 90 * Math.sin(rad(startAngle + angle - 90))
    const largeArc = angle > 180 ? 1 : 0

    const path = `M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`

    cumulativePercent += percent

    return {
      path,
      color: colors[index % colors.length],
    }
  })
}
