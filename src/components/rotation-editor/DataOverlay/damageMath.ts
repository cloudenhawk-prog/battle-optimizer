// Pure damage math for the data overlay: per-mode event damage, totals and name/type aggregation
import type { DamageEvent } from '../../../types/events'
import type { Snapshot } from '../../../types/snapshot'

/** Which damage figure the overlay displays. */
export type DamageMode = 'average' | 'normal' | 'crit'

// Source colours (impact dial, source ledger, hit log) — cyan/amber/violet/teal/coral
export const PIE_CHART_COLORS = [
  'rgba(100, 220, 255, 0.75)', // cyan
  'rgba(255, 190,  60, 0.75)', // amber
  'rgba(200, 120, 255, 0.75)', // violet
  'rgba(100, 220, 175, 0.75)', // teal
  'rgba(255, 130, 100, 0.75)', // coral
]

/** Damage types are stored as SCREAMING_SNAKE ids; "NEGATIVE_STATUS" → "Negative Status". */
export function formatDmgType(type: string): string {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

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
