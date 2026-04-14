import { useState, useCallback } from 'react'
import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { GlobalColumns } from '../../types/tableDefinitions'
import type { OptimizerBlock } from '../../types/optimizerBlock'
import type { Settings } from '../useSettings'
import { extractSteps } from '../../utils/importExport'
import { replaySteps } from '../../utils/engine/replaySteps'

// ========== Types ============================================================================================================

export type AttemptResult = {
  valid: boolean
  /** Overall DPS of the full rotation after the draft is applied. Present when valid=true. */
  dps?: number
  /** Human-readable failure reason. Present when valid=false. */
  reason?: string
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
 * Validates a flex block's draft sequence against the full rotation.
 * Replays pre-block steps, then the draft steps, then post-block steps, and reports
 * whether the combined rotation is valid and what the overall DPS is.
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
  const [result, setResult] = useState<AttemptResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [lastBlockId, setLastBlockId] = useState<string | null>(null)

  const run = useCallback((blockId: string) => {
    const block = optimizerBlocks.find(b => b.id === blockId)
    if (!block || block.draftSteps.length === 0) {
      setResult({ valid: false, reason: 'Add at least one step before attempting.' })
      setLastBlockId(blockId)
      return
    }

    setIsRunning(true)
    setResult(null)
    setLastBlockId(blockId)

    const baseParams = {
      charactersMap,
      characterColumnsMap,
      globalColumns,
      enemy,
      autocastFollowUps: settings.autocastFollowUps,
    }

    const allSteps = extractSteps(snapshots)
    const preBlockSteps = allSteps.slice(0, block.insertAfterStepCount)
    const postBlockSteps = allSteps.slice(block.insertAfterStepCount)
    const initialSnapshot = { ...snapshots[0] }

    // Replay pre-block steps to reach the state at the insertion point
    let preSnapshots: Snapshot[] = [initialSnapshot]
    let preEngineState = undefined

    if (preBlockSteps.length > 0) {
      const preReplay = replaySteps({
        steps: preBlockSteps,
        startingSnapshots: [initialSnapshot],
        ...baseParams,
      })
      if (!preReplay.valid) {
        setResult({ valid: false, reason: 'Could not replay the steps before this block (internal error).' })
        setIsRunning(false)
        return
      }
      preSnapshots = preReplay.snapshots
      preEngineState = preReplay.engineState
    }

    // Replay draft steps
    const draftReplay = replaySteps({
      steps: block.draftSteps,
      startingSnapshots: preSnapshots,
      startingEngineState: preEngineState,
      ...baseParams,
    })

    if (!draftReplay.valid) {
      setResult({ valid: false, reason: 'One or more draft steps could not be applied (character or action not available).' })
      setIsRunning(false)
      return
    }

    // Replay post-block steps on top of the draft result
    if (postBlockSteps.length === 0) {
      const lastSnap = draftReplay.snapshots[draftReplay.snapshots.length - 2] ?? draftReplay.snapshots[draftReplay.snapshots.length - 1]
      setResult({ valid: true, dps: lastSnap?.dps ?? 0 })
    } else {
      const postReplay = replaySteps({
        steps: postBlockSteps,
        startingSnapshots: draftReplay.snapshots,
        startingEngineState: draftReplay.engineState,
        ...baseParams,
      })
      if (!postReplay.valid) {
        setResult({ valid: false, reason: 'The rotation breaks after these draft steps are inserted.' })
      } else {
        const lastSnap = postReplay.snapshots[postReplay.snapshots.length - 2] ?? postReplay.snapshots[postReplay.snapshots.length - 1]
        setResult({ valid: true, dps: lastSnap?.dps ?? 0 })
      }
    }

    setIsRunning(false)
  }, [snapshots, optimizerBlocks, charactersMap, characterColumnsMap, globalColumns, enemy, settings])

  function reset() {
    setResult(null)
    setLastBlockId(null)
  }

  return { run, result, isRunning, lastBlockId, reset }
}
