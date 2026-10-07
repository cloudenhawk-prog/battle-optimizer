// Pure buff analysis for the summary: modifier tooltip info and limited-duration buff coverage/uptime
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'
import type { Character } from '../../../types/character'
import type { ElementType } from '../../../types/baseTypes'
import type { DamageModifier } from '../../../types/modifiers'
import type { BuffUptimeEntry, ModifierDisplayInfo } from './summaryTypes'
import { computeRotationDuration } from './rotationStats'

// ========== Modifier Description Map =======================================================================================

export function buildModifierInfoMap(characters: Character[]): Map<string, ModifierDisplayInfo> {
  const map = new Map<string, ModifierDisplayInfo>()
  const addMod = (mod: DamageModifier) => {
    const info: ModifierDisplayInfo = {
      description: mod.description,
      color: mod.color,
      stats: mod.characterStats,
      showStats: mod.showStats,
      targetStrategy: mod.targetStrategy,
    }
    // Index by original name AND stripped name so lookup works regardless of
    // whether entry.displayName came from contributions (original) or fell
    // back to the snapshot buff key (stripped, no spaces).
    if (!map.has(mod.displayName)) map.set(mod.displayName, info)
    const stripped = mod.displayName.replace(/\s+/g, '')
    if (stripped !== mod.displayName && !map.has(stripped)) map.set(stripped, info)
  }
  for (const char of characters) {
    for (const mod of char.damageModifiers) addMod(mod)
    for (const action of char.actions) {
      for (const mod of action.damageModifiers) addMod(mod)
    }
  }
  return map
}

// ========== Buff Uptime =====================================================================================================

/**
 * Per limited-duration buff: % of team damage dealt while it was up (coverage) and % of rotation time
 * it was up (uptime). Permanent buffs are skipped; entries under 1% coverage are dropped.
 */
export function computeBuffUptime(
  snapshots: Snapshot[],
  damageEvents: DamageEvent[],
  characters: Character[],
  grandTotal: number,
): BuffUptimeEntry[] {
  if (grandTotal === 0 || damageEvents.length === 0) return []

  const charElementMap = new Map(characters.map(c => [c.name, c.element]))

  // Only rows with a resolved action count — the final row is always empty
  const rotationDuration = computeRotationDuration(snapshots)

  // Build display-name lookup: stripped key → original name + owner.
  // Seed from character/action modifiers first so trackerOnly buffs (which never appear in
  // event.contributions because they have no stats) still resolve their display name.
  const displayNameMap = new Map<string, { displayName: string; ownerCharacter: string | null }>()
  for (const char of characters) {
    const allMods = [
      ...char.damageModifiers,
      ...char.actions.flatMap(a => a.damageModifiers),
    ]
    for (const mod of allMods) {
      const stripped = mod.displayName.replace(/\s+/g, '')
      if (!displayNameMap.has(stripped)) {
        displayNameMap.set(stripped, {
          displayName: mod.displayName,
          ownerCharacter: mod.ownerCharacter ?? null,
        })
      }
    }
  }
  // Then fill in names only seen in event contributions (e.g. runtime-stamped modifiers).
  // Note: seeded entries are NOT overwritten, so a contribution's ownerCharacter never wins over the seed.
  for (const event of damageEvents) {
    for (const contrib of Object.values(event.contributions)) {
      if (!contrib.displayName) continue
      const stripped = contrib.displayName.replace(/\s+/g, '')
      if (!displayNameMap.has(stripped)) {
        displayNameMap.set(stripped, {
          displayName: contrib.displayName,
          ownerCharacter: contrib.ownerCharacter ?? null,
        })
      }
    }
  }

  // Identify limited-duration buff keys (those that were ever timed, not permanent)
  const limitedBuffKeys = new Set<string>()
  for (const snap of snapshots) {
    for (const [key, timeLeft] of Object.entries(snap.buffsTimeLeft)) {
      if (timeLeft < Infinity && timeLeft > 0) limitedBuffKeys.add(key)
    }
  }

  // Build snapshotId→snapshot map (snap.id is string, event.snapshotId is number)
  const snapshotMap = new Map<string, Snapshot>()
  for (const snap of snapshots) snapshotMap.set(snap.id, snap)

  // Accumulate damage covered per limited buff key
  const coverageMap = new Map<string, number>()
  for (const event of damageEvents) {
    const snap = snapshotMap.get(String(event.snapshotId))
    if (!snap) continue
    for (const [key, stacks] of Object.entries(snap.buffs)) {
      if (stacks > 0 && limitedBuffKeys.has(key)) {
        coverageMap.set(key, (coverageMap.get(key) ?? 0) + event.average)
      }
    }
  }

  // Accumulate active time per limited buff key
  const timeMap = new Map<string, number>()
  for (const snap of snapshots) {
    if (!snap.action) continue
    const duration = snap.toTime - snap.fromTime
    if (duration <= 0) continue
    for (const [key, stacks] of Object.entries(snap.buffs)) {
      if (stacks > 0 && limitedBuffKeys.has(key)) {
        timeMap.set(key, (timeMap.get(key) ?? 0) + duration)
      }
    }
  }

  // Find the first snapshot where each buff transitions from absent/0 → active
  const firstAppliedAtMap = new Map<string, number>()
  for (let i = 0; i < snapshots.length; i++) {
    const snap = snapshots[i]
    const prev = snapshots[i - 1]
    for (const key of limitedBuffKeys) {
      if (firstAppliedAtMap.has(key)) continue
      const cur = snap.buffs[key] ?? 0
      const prv = prev ? (prev.buffs[key] ?? 0) : 0
      if (cur > 0 && prv === 0) {
        firstAppliedAtMap.set(key, snap.fromTime)
      }
    }
  }

  return Array.from(coverageMap.entries())
    .map(([key, coveredDamage]) => {
      const info = displayNameMap.get(key)
      const ownerCharacter = info?.ownerCharacter ?? null
      const activeTime = timeMap.get(key) ?? 0
      return {
        key,
        displayName: info?.displayName ?? key,
        ownerCharacter,
        ownerElement: (ownerCharacter ? (charElementMap.get(ownerCharacter) ?? '') : '') as ElementType | '',
        coveredDamage,
        coveragePct: (coveredDamage / grandTotal) * 100,
        timeUptimePct: rotationDuration > 0 ? (activeTime / rotationDuration) * 100 : 0,
        firstAppliedAt: firstAppliedAtMap.get(key) ?? 0,
      }
    })
    .filter(e => e.coveragePct >= 1)
    .sort((a, b) => b.coveredDamage - a.coveredDamage)
}
