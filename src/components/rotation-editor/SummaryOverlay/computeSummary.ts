// Pure summary aggregation: per-character damage, pooled "other" damage, action breakdowns, energy flow
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'
import type { Character } from '../../../types/character'
import type { ActionBreakdownEntry, CharacterSummary, EnergyFlowEntry, GlobalDamageEntry } from './summaryTypes'
import { computeFieldTimes, computeRotationDuration, countLiberations, getBaseChar } from './rotationStats'
import { computeContributionData, computeContributionOrigin } from './computeAttribution'
import { buildModifierInfoMap, computeBuffUptime } from './computeBuffs'

// ========== Rotation Summary (entry point) ==================================================================================

/** Everything the summary overlay renders, computed from the rotation result. */
export function computeRotationSummary(
  characters: Character[],
  snapshots: Snapshot[],
  damageEvents: DamageEvent[],
) {
  // Include characters who have taken actions OR who have attributed damage events (off-field passives).
  // Without the damage-event check, a purely off-field character (e.g. a passive support with
  // teamActionTriggers but no rotation entries) would be excluded, causing their "Name: ..." events
  // to fall through into passiveDamageEvents / "Other Sources".
  const charsWithActions = new Set(
    snapshots.filter(s => s.action).map(s => s.character).filter((c): c is string => !!c)
  )
  const charsWithDamage = new Set(damageEvents.map(e => getBaseChar(e.dealer)))
  const activeChars = characters.filter(c => charsWithActions.has(c.name) || charsWithDamage.has(c.name))

  const { characterSummaries, globalDamage, totalPassiveDamage, grandTotal, totalDuration, passiveDamageEvents } =
    computeSummaryData(activeChars, snapshots, damageEvents)

  return {
    activeChars,
    characterSummaries,
    globalDamage,
    totalPassiveDamage,
    grandTotal,
    totalDuration,
    passiveDamageEvents,
    contributionEntries: computeContributionData(activeChars, damageEvents),
    buffUptime: computeBuffUptime(snapshots, damageEvents, activeChars, grandTotal),
    contributionOrigin: computeContributionOrigin(activeChars, damageEvents),
    energyFlow: computeEnergyFlow(activeChars, snapshots),
    actionBreakdowns: computeActionBreakdowns(activeChars, damageEvents),
    modifierInfoMap: buildModifierInfoMap(activeChars),
  }
}

// ========== Damage Totals ===================================================================================================

/** True when the event was dealt by `name` directly or by one of its `name: ...` sources. */
function isDealtBy(e: DamageEvent, name: string): boolean {
  return e.dealer === name || e.dealer.startsWith(name + ': ')
}

export function computeSummaryData(
  characters: Character[],
  snapshots: Snapshot[],
  damageEvents: DamageEvent[],
) {
  const totalDuration = computeRotationDuration(snapshots)
  const fieldTimeMap = computeFieldTimes(snapshots)
  const libCountMap = countLiberations(characters, snapshots)

  // "Passive" = dealt by no team character at all (e.g. pooled negative-status ticks); shown as "Other Sources"
  const passiveDamageEvents = damageEvents.filter(e => !characters.some(char => isDealtBy(e, char.name)))

  const characterSummaries: CharacterSummary[] = characters.map(char => {
    const directEvents = damageEvents.filter(
      e => e.dealer === char.name,
    )
    // Coordinated attacks / echoes etc. credited to the character as "Name: Source"
    const caEvents = damageEvents.filter(
      e =>
        e.dealer !== char.name &&
        e.dealer.startsWith(char.name + ': '),
    )

    const directDamage = directEvents.reduce((s, e) => s + e.average, 0)
    const caDamage = caEvents.reduce((s, e) => s + e.average, 0)
    const passiveDamage = 0
    // totalCharacterDamage excludes passive so Pie 1 slices + "Field Effects" sum to grandTotal
    const totalCharacterDamage = directDamage + caDamage

    // An event with several dmgTypes counts fully towards each of them
    const typeMap = new Map<string, number>()
    for (const e of [...directEvents, ...caEvents]) {
      for (const t of e.dmgTypes) {
        typeMap.set(t, (typeMap.get(t) ?? 0) + e.average)
      }
    }
    const damageByType = Array.from(typeMap.entries())
      .map(([type, damage]) => ({ type, damage }))
      .sort((a, b) => b.damage - a.damage)

    return {
      name: char.name,
      element: char.element,
      image: char.image,
      directDamage,
      caDamage,
      passiveDamage,
      totalCharacterDamage,
      damageByType,
      fieldTime: fieldTimeMap[char.name] ?? 0,
      libCount: libCountMap[char.name] ?? 0,
      sequence: char.sequence,
      weaponRank: char.gear.weapon?.rank ?? null,
      weaponName: char.gear.weapon?.name ?? null,
    }
  })

  // Pool passive events by action name (one entry per status)
  const globalStatusMap = new Map<string, { damage: number; element: string }>()
  for (const e of passiveDamageEvents) {
    const statusName = e.actionName
    const existing = globalStatusMap.get(statusName)
    if (existing) {
      existing.damage += e.average
    } else {
      globalStatusMap.set(statusName, { damage: e.average, element: e.elements[0] ?? '' })
    }
  }
  const globalDamage: GlobalDamageEntry[] = Array.from(globalStatusMap.entries())
    .map(([name, { damage, element }]) => ({ name, damage, element }))
    .sort((a, b) => b.damage - a.damage)

  const totalPassiveDamage = globalDamage.reduce((s, g) => s + g.damage, 0)

  const grandTotal = damageEvents.reduce((s, e) => s + e.average, 0)

  return { characterSummaries, globalDamage, totalPassiveDamage, grandTotal, totalDuration, passiveDamageEvents }
}

// ========== Action Breakdown ================================================================================================

/** Per-character: action name → total damage (direct + CA, no passives). */
export function computeActionBreakdowns(
  characters: Character[],
  damageEvents: DamageEvent[],
): Map<string, ActionBreakdownEntry[]> {
  const result = new Map<string, ActionBreakdownEntry[]>()
  for (const char of characters) {
    const byAction = new Map<string, number>()
    const byActionCount = new Map<string, number>()
    for (const e of damageEvents) {
      if (!isDealtBy(e, char.name)) continue
      // Skip pure negative-status events dealt directly by the character (e.g. DoT ticks attributed
      // to the caster). Actions like Plunge Attack carry both BASIC and NEGATIVE_STATUS, so we only
      // skip events where NEGATIVE_STATUS is the sole dmgType.
      if (e.dmgTypes.every(t => t === 'NEGATIVE_STATUS') && e.dealer === char.name) continue
      byAction.set(e.actionName, (byAction.get(e.actionName) ?? 0) + e.average)
      byActionCount.set(e.actionName, (byActionCount.get(e.actionName) ?? 0) + 1)
    }
    result.set(
      char.name,
      Array.from(byAction.entries())
        .map(([actionName, damage]) => ({ actionName, damage, count: byActionCount.get(actionName) ?? 0 }))
        .sort((a, b) => b.damage - a.damage),
    )
  }
  return result
}

// ========== Energy Flow =====================================================================================================

export function computeEnergyFlow(
  characters: Character[],
  snapshots: Snapshot[],
): EnergyFlowEntry[] {
  if (snapshots.length === 0) return []

  const fieldTimeMap = computeFieldTimes(snapshots)
  const libCounts = countLiberations(characters, snapshots)

  // Sum raw energy generated per character directly from action definitions (ignoring scaling/share/caps)
  const actionMapByChar = new Map<string, Map<string, (typeof characters)[number]['actions'][number]>>()
  for (const char of characters) {
    const m = new Map<string, (typeof characters)[number]['actions'][number]>()
    for (const action of char.actions) m.set(action.name, action)
    actionMapByChar.set(char.name, m)
  }
  const energyGainMap = new Map<string, number>()
  for (const snap of snapshots) {
    if (!snap.character || !snap.action) continue
    const action = actionMapByChar.get(snap.character)?.get(snap.action)
    if (!action) continue
    const generated = action.energyGenerated
      .filter(e => e.energyType === 'energy')
      .reduce((sum, e) => sum + e.amount, 0)
    if (generated > 0)
      energyGainMap.set(snap.character, (energyGainMap.get(snap.character) ?? 0) + generated)
  }

  return characters.map(char => {
    const generated = energyGainMap.get(char.name) ?? 0
    const fieldTime = fieldTimeMap[char.name] ?? 0
    return {
      name: char.name,
      element: char.element,
      libCount: libCounts[char.name] ?? 0,
      fieldTime,
      energyGenerated: generated,
      energyGenPerSecond: fieldTime > 0 ? generated / fieldTime : 0,
    }
  }).filter(e => e.energyGenerated > 0 || e.libCount > 0)
}
