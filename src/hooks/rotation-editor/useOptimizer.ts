import { useState, useCallback } from 'react'
import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { GlobalColumns } from '../../types/tableDefinitions'
import type { OptimizerBlock } from '../../types/optimizerBlock'
import type { Settings } from '../useSettings'
import type { ScoredCandidate } from '../../utils/optimizer/score'
import { extractSteps } from '../../utils/importExport'
import { replaySteps } from '../../utils/engine/replaySteps'
import { initEngineState } from '../../utils/engine/step'
import { enumerate } from '../../utils/optimizer/enumerate'
import { scoreCandidate } from '../../utils/optimizer/score'

// ========== Types ============================================================================================================

export type OptimizerProgress = {
  done: number
  total: number
}

type UseOptimizerProps = {
  snapshots: Snapshot[]
  optimizerBlocks: OptimizerBlock[]
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  settings: Settings
}

// ========== Hook: useOptimizer ===============================================================================================

/**
 * Orchestrates the sequence optimizer: given optimizer blocks embedded in the rotation,
 * enumerates all legal candidate sequences and scores them by overall DPS.
 */
export function useOptimizer({
  snapshots,
  optimizerBlocks,
  charactersMap,
  characterColumnsMap,
  globalColumns,
  enemy,
  settings,
}: UseOptimizerProps) {
  const [results, setResults] = useState<ScoredCandidate[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<OptimizerProgress | null>(null)
  const [lastBlockId, setLastBlockId] = useState<string | null>(null)

  const run = useCallback((blockId: string) => {
    const block = optimizerBlocks.find(b => b.id === blockId)
    if (!block) return

    const character = charactersMap[block.character]
    if (!character) return

    setIsRunning(true)
    setResults([])
    setProgress(null)
    setLastBlockId(blockId)

    const t0 = performance.now()
    console.log(
      `[Optimizer] Run — block: ${blockId}` +
      `, character: ${block.character}` +
      `, insertAfterStepCount: ${block.insertAfterStepCount}` +
      `, duration: ${block.minDuration}s–${block.maxDuration}s`,
    )

    const baseParams = { charactersMap, characterColumnsMap, globalColumns, enemy }

    // Extract all user-visible steps from the current timeline
    const allSteps = extractSteps(snapshots)
    const preBlockSteps = allSteps.slice(0, block.insertAfterStepCount)
    const postBlockSteps = allSteps.slice(block.insertAfterStepCount)

    console.log(`[Optimizer]   Pre-block steps: ${preBlockSteps.length}, post-block steps: ${postBlockSteps.length}`)

    // Derive pre-block state: replay from scratch using the initial blank snapshot
    const initialSnapshot = { ...snapshots[0] }
    const startingSnapshots: Snapshot[] = [initialSnapshot]

    let preBlockSnapshots: Snapshot[]
    let preBlockEngineState

    if (preBlockSteps.length === 0) {
      preBlockSnapshots = startingSnapshots
      preBlockEngineState = initEngineState()
      console.log('[Optimizer]   Pre-block: starting from scratch (no prior steps)')
    } else {
      const preReplay = replaySteps({
        steps: preBlockSteps,
        startingSnapshots,
        ...baseParams,
        autocastFollowUps: settings.autocastFollowUps,
      })
      if (!preReplay.valid) {
        // Pre-block replay failed — nothing to enumerate
        console.warn('[Optimizer]   Pre-block replay failed — aborting')
        setIsRunning(false)
        setProgress({ done: 0, total: 0 })
        return
      }
      preBlockSnapshots = preReplay.snapshots
      preBlockEngineState = preReplay.engineState
      console.log(`[Optimizer]   Pre-block replay OK — ${preReplay.snapshots.length} snapshots`)
    }

    // Enumerate all legal candidate sequences
    const candidates = enumerate({
      preBlockSnapshots,
      preBlockEngineState,
      character,
      config: block,
      ...baseParams,
      autocastFollowUps: settings.autocastFollowUps,
    })

    console.log(`[Optimizer]   Scoring ${candidates.length} candidates…`)
    setProgress({ done: 0, total: candidates.length })

    // Score all candidates synchronously (typical count: < 5,000 — fast enough without batching)
    // NOTE: because this is synchronous, React cannot re-render during this loop, so the
    // progress counter in the UI will not visually update until the run completes.
    const scored: ScoredCandidate[] = []
    const logEvery = Math.max(1, Math.floor(candidates.length / 4))
    for (let i = 0; i < candidates.length; i++) {
      const s = scoreCandidate({
        candidate: candidates[i],
        postBlockSteps,
        ...baseParams,
        autocastFollowUps: settings.autocastFollowUps,
      })
      scored.push(s)
      if ((i + 1) % logEvery === 0 || i === candidates.length - 1) {
        const pct = (((i + 1) / candidates.length) * 100).toFixed(0)
        console.log(`[Optimizer]   Scored ${i + 1} / ${candidates.length} (${pct}%)`)
      }
    }

    const validResults = scored
      .filter(c => c.valid)
      .sort((a, b) => b.score - a.score)

    const invalidCount = scored.length - validResults.length
    const elapsed = (performance.now() - t0).toFixed(0)
    console.log(
      `[Optimizer] Done — ${validResults.length} valid, ${invalidCount} invalid` +
      `, best DPS: ${validResults[0]?.score.toFixed(0) ?? 'n/a'}` +
      `, total: ${elapsed}ms`,
    )

    setResults(validResults)
    setProgress({ done: candidates.length, total: candidates.length })
    setIsRunning(false)
  }, [snapshots, optimizerBlocks, charactersMap, characterColumnsMap, globalColumns, enemy, settings])

  function reset() {
    setResults([])
    setProgress(null)
    setLastBlockId(null)
  }

  return { run, results, isRunning, progress, lastBlockId, reset }
}
