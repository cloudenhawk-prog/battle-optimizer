// Pure Shapley-based attribution for the summary: team contribution pie + per-character "damage origin"
import type { DamageEvent } from '../../../types/events'
import type { Character } from '../../../types/character'
import type { ElementType } from '../../../types/baseTypes'
import { splitEventByCharacter } from '../../../engine/damage/contributionAttribution'
import type { ContributionEntry, ContributionOriginEntry } from './summaryTypes'
import { getBaseChar } from './rotationStats'

// ========== Contribution Pie ================================================================================================

/**
 * Computes per-character attributed damage for the Contribution pie (Pie 2).
 * See splitEventByCharacter (contributionAttribution.ts) for the Shapley algorithm details.
 * Efficiency: Σ attributedDamage = grandTotal exactly.
 */
export function computeContributionData(
  characters: Character[],
  damageEvents: DamageEvent[],
): ContributionEntry[] {
  const charMap = new Map(characters.map(c => [c.name, c]))

  const attribution: Record<string, number> = {}

  for (const event of damageEvents) {
    const casterBase = getBaseChar(event.dealer)
    const { casterShare, externalByOwner } = splitEventByCharacter(event, casterBase)
    attribution[casterBase] = (attribution[casterBase] ?? 0) + casterShare
    for (const [owner, phi] of externalByOwner) {
      attribution[owner] = (attribution[owner] ?? 0) + phi
    }
  }

  // Consolidate all non-character keys (e.g. passive negative status dealers) into a
  // single '__OTHER__' player so it appears as a first-class Pie 2 slice.
  const charNames = new Set(characters.map(c => c.name))
  let otherTotal = 0
  for (const key of Object.keys(attribution)) {
    if (!charNames.has(key)) {
      otherTotal += attribution[key]
      delete attribution[key]
    }
  }
  if (otherTotal > 0) attribution['__OTHER__'] = otherTotal

  return Object.entries(attribution)
    .filter(([, v]) => v > 0)
    .map(([name, attributedDamage]) => {
      const char = charMap.get(name)
      return {
        name,
        element: (char?.element ?? '') as ElementType | '',
        image: char?.image,
        attributedDamage,
      }
    })
    .sort((a, b) => b.attributedDamage - a.attributedDamage)
}

// ========== Contribution Origin =============================================================================================

/**
 * For each character: share of their own damage that is self-made vs. enabled by each teammate's buffs.
 * Teammates below 2% are hidden; non-character dealers are dropped.
 */
export function computeContributionOrigin(
  characters: Character[],
  damageEvents: DamageEvent[],
): ContributionOriginEntry[] {
  const charMap = new Map(characters.map(c => [c.name, c]))

  const charTotals = new Map<string, { self: number; external: Map<string, number> }>()

  for (const event of damageEvents) {
    const casterBase = getBaseChar(event.dealer)
    if (!charTotals.has(casterBase)) charTotals.set(casterBase, { self: 0, external: new Map() })
    const entry = charTotals.get(casterBase)!

    const { casterShare, externalByOwner } = splitEventByCharacter(event, casterBase)
    entry.self += casterShare
    for (const [owner, phi] of externalByOwner) {
      entry.external.set(owner, (entry.external.get(owner) ?? 0) + phi)
    }
  }

  return Array.from(charTotals.entries())
    .filter(([name]) => charMap.has(name))
    .map(([charName, { self, external }]) => {
      const char = charMap.get(charName)!
      const total = self + Array.from(external.values()).reduce((s, v) => s + v, 0)
      if (total <= 0) return null
      const buffedBy = Array.from(external.entries())
        .filter(([, amt]) => amt / total >= 0.02)
        .map(([ownerName, amount]) => ({
          charName: ownerName,
          element: (charMap.get(ownerName)?.element ?? '') as ElementType,
          pct: (amount / total) * 100,
        }))
        .sort((a, b) => b.pct - a.pct)
      return { charName, element: char.element, selfPct: (self / total) * 100, buffedBy }
    })
    .filter(Boolean) as ContributionOriginEntry[]
}
