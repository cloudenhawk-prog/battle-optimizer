// Shared timeline helpers for the summary: dealer → character, rotation duration, field time, liberation counts
import type { Snapshot } from '../../../types/snapshot'
import type { Character } from '../../../types/character'

/** Damage dealers are either `Name` (direct) or `Name: Source` (coordinated attacks etc.) — returns `Name`. */
export function getBaseChar(dealer: string): string {
  const colonIdx = dealer.indexOf(': ')
  return colonIdx >= 0 ? dealer.slice(0, colonIdx) : dealer
}

/** First action start → last action end. The final row is always empty, so only rows with an action count. */
export function computeRotationDuration(snapshots: Snapshot[]): number {
  const firstActionSnap = snapshots.find(s => s.action)
  const lastActionSnap = [...snapshots].reverse().find(s => s.action)
  return firstActionSnap && lastActionSnap
    ? lastActionSnap.toTime - firstActionSnap.fromTime
    : 0
}

/** Seconds each character spent casting (sum of their action rows' durations). */
export function computeFieldTimes(snapshots: Snapshot[]): Record<string, number> {
  const fieldTimeMap: Record<string, number> = {}
  for (const s of snapshots) {
    if (!s.character || !s.action) continue
    fieldTimeMap[s.character] = (fieldTimeMap[s.character] ?? 0) + (s.toTime - s.fromTime)
  }
  return fieldTimeMap
}

/**
 * Heuristic liberation count: a row where a character's resonance energy drops by >= 50% of its max.
 * Characters without a resonance energy bar are skipped.
 */
export function countLiberations(characters: Character[], snapshots: Snapshot[]): Record<string, number> {
  const libCountMap: Record<string, number> = {}
  for (let i = 1; i < snapshots.length; i++) {
    for (const char of characters) {
      const maxE = char.maxEnergies.energy ?? 0
      if (maxE === 0) continue
      const cur = snapshots[i].charactersEnergies[char.name]?.energy ?? 0
      const prv = snapshots[i - 1].charactersEnergies[char.name]?.energy ?? 0
      if (prv - cur >= maxE * 0.5) libCountMap[char.name] = (libCountMap[char.name] ?? 0) + 1
    }
  }
  return libCountMap
}

export type FieldSegment = { character: string; action: string; from: number; to: number }

/** One segment per action row (who was on field, doing what, when), timed from the first action's start. */
export function computeFieldSegments(snapshots: Snapshot[]): FieldSegment[] {
  const first = snapshots.find(s => s.action)
  if (!first) return []
  return snapshots
    .filter(s => s.character && s.action)
    .map(s => ({
      character: s.character!,
      action: s.resolvedDisplayName ?? s.action!,
      from: s.fromTime - first.fromTime,
      to: s.toTime - first.fromTime,
    }))
}
