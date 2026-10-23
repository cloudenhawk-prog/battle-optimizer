// Time-sliced build optimizer run: scores the baseline, then every candidate in small setTimeout chunks.
import type { Character, ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { GlobalColumns, TableConfig } from '../../types/tableDefinitions'
import type { Settings } from '../../types/settings'
import type { RotationStep } from '../../types/rotation'
import { resolveCharacter } from '../../engine/gear/resolveCharacter'
import type { BuildResult, EchoOptConfig } from './types'
import { buildAllCandidates } from './candidates'
import { detailedCandidateLines } from './labels'
import { scoreRotation, rankResults } from './scoring'

// ========== Run ==============================================================================================================

// Max main-thread time per chunk; bounds UI blocking regardless of how expensive one replay is.
const BUDGET_MS = 5

export type BuildOptimizerRunParams = {
  steps: RotationStep[]
  /** The character being optimized, as currently in battle (its gear is the starting point). */
  selectedChar: ResolvedCharacter
  /** Unresolved definition of the same character; candidates are re-resolved from it with new gear. */
  baseChar: Character
  charactersInBattle: ResolvedCharacter[]
  echoConfig: EchoOptConfig
  globalTier: number
  globalColumns: GlobalColumns
  characterColumnsMap: Record<string, string[]>
  enemy: Enemy
  tableConfig: TableConfig
  settings: Settings
  /** Checked before every chunk and before finishing; true stops the run silently. */
  isCancelled: () => boolean
  /** Fraction of candidates processed (0..1), reported after every chunk. */
  onProgress: (fraction: number) => void
  /** Ranked results, best first; the baseline row has isCurrent = true. */
  onDone: (results: BuildResult[]) => void
}

/**
 * Starts an asynchronous optimizer run. The baseline and candidate list are computed synchronously;
 * candidates are then scored in BUDGET_MS chunks scheduled with setTimeout(0) so React can repaint.
 */
export function runBuildOptimizer(params: BuildOptimizerRunParams): void {
  const {
    steps, selectedChar, baseChar, charactersInBattle, echoConfig, globalTier,
    globalColumns, characterColumnsMap, enemy, tableConfig, settings,
    isCancelled, onProgress, onDone,
  } = params
  const selectedCharName = selectedChar.name
  const currentCharactersMap = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))

  // Score the current build as the baseline entry
  const baselineDPS = scoreRotation({
    steps, charactersMap: currentCharactersMap, characterColumnsMap, globalColumns,
    enemy, tableConfig, settings, autocastFollowUps: true,
  })

  // Generate all build candidates from the echo configuration
  const candidates = buildAllCandidates(selectedChar, echoConfig, globalTier)

  const scored: BuildResult[] = [{
    label: 'Current build', buildDesc: '', dps: baselineDPS, delta: 0, deltaPct: 0, isCurrent: true,
  }]

  let idx = 0

  function processChunk() {
    if (isCancelled()) return

    const deadline = performance.now() + BUDGET_MS
    while (idx < candidates.length && performance.now() < deadline) {
      const { gear, buildLabel } = candidates[idx]
      // Skip the unmodified candidate — its DPS is already captured in the baseline entry
      if (buildLabel !== '') {
        const candidateChar = resolveCharacter(baseChar, gear)
        const dps = scoreRotation({
          steps,
          charactersMap: { ...currentCharactersMap, [selectedCharName]: candidateChar },
          characterColumnsMap,
          globalColumns,
          enemy,
          tableConfig,
          settings,
          autocastFollowUps: true,
        })
        scored.push({
          label: buildLabel,
          buildDesc: buildLabel,
          dps,
          delta: 0,
          deltaPct: 0,
          isCurrent: false,
          details: detailedCandidateLines(gear.echoSlots, echoConfig),
        })
      }
      idx++
    }

    // Always update progress before scheduling next chunk so React can render it
    onProgress(idx / candidates.length)

    const done = idx >= candidates.length
    if (!done) {
      setTimeout(processChunk, 0)
      return
    }

    if (isCancelled()) return
    onDone(rankResults(scored, baselineDPS))
  }

  setTimeout(processChunk, 0)
}
