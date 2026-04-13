import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { GlobalColumns } from '../../types/tableDefinitions'
import type { OptimizerBlock, RequiredAction } from '../../types/optimizerBlock'
import type { RotationStep } from '../importExport'
import type { EngineState } from '../engine/step'
import { engineStep } from '../engine/step'
import { getAvailableActions } from '../engine/choices'
import { assignCharacterToRow } from '../hooks/snapshotHelpers'
import { cloneSnapshots, cloneEngineState } from '../mcts/node'

// ========== Types ============================================================================================================

export type CandidateSequence = {
  /** The (character, action) pairs that make up this candidate block. */
  steps: RotationStep[]
  /** Snapshot array ending with a blank placeholder, ready for post-block replay. */
  terminalSnapshots: Snapshot[]
  /** Engine state at the end of this candidate's block. */
  terminalEngineState: EngineState
  /** Total duration of this candidate's block in seconds. */
  blockDuration: number
}

type EnumerateParams = {
  preBlockSnapshots: Snapshot[]
  preBlockEngineState: EngineState
  character: ResolvedCharacter
  config: OptimizerBlock
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  autocastFollowUps: boolean
}

// ========== enumerate ========================================================================================================

/**
 * DFS enumeration of all legal action sequences for one character within the given constraints.
 *
 * At each node:
 *   - Calls getAvailableActions to find legal next actions
 *   - Filters out requiresSwapOut actions and banned actions
 *   - Prunes immediately when blockDuration exceeds maxDuration
 *   - Collects leaves when blockDuration >= minDuration and all requiredActions have appeared
 *
 * Returns every valid candidate sequence for downstream scoring.
 */
export function enumerate(params: EnumerateParams): CandidateSequence[] {
  const {
    preBlockSnapshots,
    preBlockEngineState,
    character,
    config,
    charactersMap,
    characterColumnsMap,
    globalColumns,
    enemy,
    autocastFollowUps,
  } = params

  // toTime of the last resolved snapshot before the block starts
  const blockStartTime = preBlockSnapshots.length > 1
    ? (preBlockSnapshots[preBlockSnapshots.length - 2]?.toTime ?? 0)
    : 0

  // Map from action key (name or groupName) → required minimum count
  const requiredMap = new Map<string, number>(
    config.requiredActions.map((r: RequiredAction) => [r.action, r.minCount]),
  )
  const bannedSet = new Set(config.bannedActions)

  const baseParams = { charactersMap, characterColumnsMap, globalColumns, enemy }
  const results: CandidateSequence[] = []

  const requiredDesc = config.requiredActions.map(r => `${r.action} ×${r.minCount}`).join(', ') || 'none'
  console.log(
    `[Optimizer] Enumerate start — character: ${character.name}` +
    `, duration: ${config.minDuration}s–${config.maxDuration}s` +
    `, required: [${requiredDesc}]` +
    `, banned: [${config.bannedActions.join(', ') || 'none'}]` +
    `, blockStartTime: ${blockStartTime.toFixed(2)}s`,
  )
  const enumerateStartMs = performance.now()
  let nodesVisited = 0

  function dfs(
    snapshots: Snapshot[],
    engineState: EngineState,
    steps: RotationStep[],
    satisfiedCounts: Map<string, number>,
  ) {
    nodesVisited++
    const lastResolved = snapshots[snapshots.length - 2]
    const currentDuration = (lastResolved?.toTime ?? 0) - blockStartTime

    // Collect as a valid leaf if constraints are satisfied
    if (currentDuration >= config.minDuration && steps.length > 0) {
      const allRequiredSatisfied = requiredMap.size === 0 ||
        [...requiredMap.entries()].every(([r, n]) => (satisfiedCounts.get(r) ?? 0) >= n)
      if (allRequiredSatisfied) {
        if (results.length < 5) {
          // Log the first few candidates so we can sanity-check the sequences
          console.log(
            `[Optimizer]   Candidate #${results.length + 1}: [${steps.map(s => s.action).join(' → ')}]` +
            ` (${currentDuration.toFixed(2)}s)`,
          )
        }
        results.push({
          steps: [...steps],
          terminalSnapshots: snapshots,
          terminalEngineState: engineState,
          blockDuration: currentDuration,
        })
      }
    }

    // Prune: no point going deeper if already at or past max duration
    if (currentDuration >= config.maxDuration) return

    // Get legal actions for this character from the current blank row's state
    const currentStateSnapshot = snapshots[snapshots.length - 1]
    const available = getAvailableActions(currentStateSnapshot, character).filter(action => {
      // Never allow swap-out actions — the character must stay on field during the block
      if (action.castConditions.requiresSwapOut) return false
      // Apply banned list (check both name and groupName)
      const nameMatch = bannedSet.has(action.name)
      const groupMatch = action.groupName !== undefined && bannedSet.has(action.groupName)
      return !nameMatch && !groupMatch
    })

    for (const action of available) {
      const clonedSnapshots = cloneSnapshots(snapshots)
      const clonedEngine = cloneEngineState(engineState)

      // Assign the block character to the last blank row before calling engineStep
      const lastIdx = clonedSnapshots.length - 1
      clonedSnapshots[lastIdx] = assignCharacterToRow(clonedSnapshots[lastIdx], character.name)
      const snapshotId = Number(clonedSnapshots[lastIdx].id)

      let newSnapshots: Snapshot[]
      let newEngine: EngineState

      try {
        const result = engineStep({
          snapshots: clonedSnapshots,
          snapshotId,
          actionName: action.name,
          engineState: clonedEngine,
          autocastFollowUps,
          ...baseParams,
        })
        newSnapshots = result.snapshots
        newEngine = result.engineState
      } catch {
        // This action is invalid in some way the filter didn't catch — skip it
        continue
      }

      // Prune branches that already overshoot max duration
      const newLastResolved = newSnapshots[newSnapshots.length - 2]
      const newDuration = (newLastResolved?.toTime ?? 0) - blockStartTime
      if (newDuration > config.maxDuration) continue

      // Track counts of required actions used so far
      const newCounts = new Map(satisfiedCounts)
      const nameKey = requiredMap.has(action.name) ? action.name : null
      const groupKey = action.groupName !== undefined && requiredMap.has(action.groupName) ? action.groupName : null
      const countKey = nameKey ?? groupKey
      if (countKey !== null) {
        newCounts.set(countKey, (newCounts.get(countKey) ?? 0) + 1)
      }

      const newStep: RotationStep = { character: character.name, action: action.name }
      dfs(newSnapshots, newEngine, [...steps, newStep], newCounts)
    }
  }

  dfs(cloneSnapshots(preBlockSnapshots), cloneEngineState(preBlockEngineState), [], new Map())

  const elapsed = (performance.now() - enumerateStartMs).toFixed(0)
  console.log(
    `[Optimizer] Enumerate done — ${results.length} candidates from ${nodesVisited} nodes in ${elapsed}ms`,
  )

  return results
}
