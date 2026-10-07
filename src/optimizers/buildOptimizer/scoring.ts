// Build scoring: replays the rotation with a candidate roster and ranks results against the current build.
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { GlobalColumns, TableConfig } from '../../types/tableDefinitions'
import type { Settings } from '../../types/settings'
import type { RotationStep } from '../../types/rotation'
import { replaySteps } from '../../engine/simulation/replaySteps'
import { initEngineState } from '../../engine/simulation/engineState'
import { createEmptySnapshot } from '../../engine/state/createEmptySnapshot'
import type { BuildResult } from './types'

// ========== Scoring ==========================================================================================================

/** Replays `steps` from a fresh row 0 and returns the final DPS (0 for an empty or invalid replay). */
export function scoreRotation(params: {
  steps: RotationStep[]
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  tableConfig: TableConfig
  settings: Settings
  autocastFollowUps: boolean
}): number {
  const { steps, charactersMap, characterColumnsMap, globalColumns, enemy, tableConfig, settings, autocastFollowUps } = params
  if (steps.length === 0) return 0

  const startingSnapshot = createEmptySnapshot(
    charactersMap,
    characterColumnsMap,
    globalColumns,
    tableConfig,
    settings.startWithFullEnergy,
  )

  const result = replaySteps({
    steps,
    startingSnapshots: [startingSnapshot],
    startingEngineState: initEngineState(),
    charactersMap,
    characterColumnsMap,
    globalColumns,
    enemy,
    autocastFollowUps,
  })

  if (!result.valid) return 0
  // The last snapshot is the trailing blank row; the one before it is the last resolved action
  const lastResolved = result.snapshots[result.snapshots.length - 2]
  return lastResolved?.dps ?? 0
}

// ========== Ranking ==========================================================================================================

/** Sorts by DPS (desc, in place) and fills delta / deltaPct relative to the current build's DPS. */
export function rankResults(scored: BuildResult[], baselineDPS: number): BuildResult[] {
  scored.sort((a, b) => b.dps - a.dps)
  const finalBaseline = scored.find(r => r.isCurrent)?.dps ?? baselineDPS
  return scored.map(r => ({
    ...r,
    delta: r.dps - finalBaseline,
    deltaPct: finalBaseline > 0 ? ((r.dps - finalBaseline) / finalBaseline) * 100 : 0,
  }))
}
