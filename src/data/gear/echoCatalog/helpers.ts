// Echo catalog lookups (sets/cost of an echo) and buildEcho(), which turns a catalog entry + rolled stats into an Echo.
import type { Echo } from '../../../types/gear'
import type { CharacterStats } from '../../../types/stats'
import { buildBaseStats } from '../echoStats'
import { echoCatalog } from './catalog'
import type { EchoCatalogEntry } from './types'

// ========== Utility Functions ================================================================================================

/** Returns all set names that a given echo belongs to (an echo can belong to multiple sets). */
export function getEchoSets(echoName: string): string[] {
  return Object.entries(echoCatalog)
    .filter(([, echoes]) => echoes.some(e => e.name === echoName))
    .map(([setName]) => setName)
}

/** Returns the cost of a named echo from the first defined set it is found in, or undefined if not in the catalog. */
export function getEchoCost(echoName: string): 1 | 3 | 4 | undefined {
  for (const echoes of Object.values(echoCatalog)) {
    const found = echoes.find(e => e.name === echoName)
    if (found) return found.cost
  }
  return undefined
}

/** Returns all defined echo entries for a given set. */
export function getEchoesForSet(setName: string): EchoCatalogEntry[] {
  return echoCatalog[setName] ?? []
}

/**
 * Builds a fully-resolved Echo object from a catalog entry.
 * Mirrors the pattern used by EchoPickerModal when confirming a custom echo.
 *
 * @param setName      - The echo set the echo belongs to.
 * @param echoName     - The echo's name as it appears in the catalog.
 * @param mainStatKey  - The rolled main stat key (e.g. 'bonusDEF', 'energyPercent').
 * @param mainStatValue - The rolled main stat value at max tune.
 * @param subStats     - The echo's rolled sub-stats.
 */
export function buildEcho(
  setName: string,
  echoName: string,
  mainStatKey: keyof CharacterStats,
  mainStatValue: number,
  subStats: Partial<CharacterStats>,
): Echo {
  const entry = echoCatalog[setName]?.find(e => e.name === echoName)
  if (!entry) throw new Error(`Echo "${echoName}" not found in set "${setName}"`)

  return {
    name: entry.name,
    setName: entry.setName,
    cost: entry.cost,
    icon: entry.icon,
    info_icon: entry.info_icon,
    info: entry.info,
    baseStats: buildBaseStats(entry.cost, mainStatKey, mainStatValue),
    subStats,
    ...(entry.firstSlotStats ? { firstSlotStats: entry.firstSlotStats } : {}),
    ...(entry.echoSkill ? { echoSkill: entry.echoSkill } : {}),
    ...(entry.injectedModifiers ? { injectedModifiers: entry.injectedModifiers } : {}),
    ...(entry.injectedSideEffects ? { injectedSideEffects: entry.injectedSideEffects } : {}),
    ...(entry.conditionalStats ? { conditionalStats: entry.conditionalStats } : {}),
  }
}
