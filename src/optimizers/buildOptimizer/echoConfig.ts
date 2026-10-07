// Echo optimizer config helpers: default slot config and (de)serialization to plain JSON (Sets ↔ arrays).
import type { CharacterStats } from '../../types/stats'
import type { EchoOptConfig, EchoSlotConfig } from './types'

// ========== Defaults =========================================================================================================

export function makeDefaultSlotConfig(): EchoSlotConfig {
  return {
    enabledMainStats: new Set<keyof CharacterStats>(),
    enabledSubstats: new Set<keyof CharacterStats>(),
    pinnedSubstats: new Set<keyof CharacterStats>(),
    substatGroupSize: 3,
  }
}

// ========== Persisted Shape ==================================================================================================

export type PersistedSlotConfig = {
  enabledMainStats: string[]
  enabledSubstats: string[]
  pinnedSubstats: string[]
  substatGroupSize: number
}

export type PersistedCharConfig = {
  globalTier: number
  echoConfig: Partial<Record<string, PersistedSlotConfig>>
}

/** Sets → arrays, keyed by slot number as string ('1'..'5'). Unconfigured slots are omitted. */
export function serializeEchoConfig(echoConfig: EchoOptConfig): Partial<Record<string, PersistedSlotConfig>> {
  const persisted: Partial<Record<string, PersistedSlotConfig>> = {}
  for (const k of ['1', '2', '3', '4', '5'] as const) {
    const slot = Number(k) as 1 | 2 | 3 | 4 | 5
    const s = echoConfig[slot]
    if (s) {
      persisted[k] = {
        enabledMainStats: [...s.enabledMainStats] as string[],
        enabledSubstats:  [...s.enabledSubstats]  as string[],
        pinnedSubstats:   [...s.pinnedSubstats]   as string[],
        substatGroupSize: s.substatGroupSize,
      }
    }
  }
  return persisted
}

/** Arrays → Sets. Tolerates configs saved before pinning / group size existed. */
export function deserializeEchoConfig(persisted: Partial<Record<string, PersistedSlotConfig>>): EchoOptConfig {
  const echoConfig: EchoOptConfig = {}
  for (const k of ['1', '2', '3', '4', '5'] as const) {
    const slot = Number(k) as 1 | 2 | 3 | 4 | 5
    const s = persisted[k]
    if (s) {
      echoConfig[slot] = {
        enabledMainStats: new Set(s.enabledMainStats as Array<keyof CharacterStats>),
        enabledSubstats:  new Set(s.enabledSubstats  as Array<keyof CharacterStats>),
        pinnedSubstats:   new Set((s.pinnedSubstats ?? []) as Array<keyof CharacterStats>),
        substatGroupSize: s.substatGroupSize ?? 3,
      }
    }
  }
  return echoConfig
}
