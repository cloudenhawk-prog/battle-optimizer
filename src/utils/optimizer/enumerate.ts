import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { GlobalColumns } from '../../types/tableDefinitions'
import type { RotationStep } from '../importExport'
import type { EngineState } from '../engine/step'
import { engineStep } from '../engine/step'
import { getAvailableActions } from '../engine/choices'
import { assignCharacterToRow } from '../hooks/snapshotHelpers'
import { cloneSnapshots, cloneEngineState } from '../mcts/node'

// ========== Types ============================================================================================================

/** Local config type for the enumerate utility — preserved for potential future use. */
type RequiredAction = {
  action: string
  minCount: number
  maxCount?: number
}

type EnumerateConfig = {
  id: string
  character: string
  minDuration: number
  maxDuration: number
  requiredActions: RequiredAction[]
  bannedActions: string[]
  insertAfterStepCount: number
}

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
  config: EnumerateConfig
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

  // Maps from action key (name or groupName) → min/max count constraints
  const requiredMinMap = new Map<string, number>(
    config.requiredActions.map((r: RequiredAction) => [r.action, r.minCount]),
  )
  const requiredMaxMap = new Map<string, number>(
    config.requiredActions
      .filter((r: RequiredAction) => r.maxCount !== undefined)
      .map((r: RequiredAction) => [r.action, r.maxCount!]),
  )
  /** Kept for backwards compat with the rest of the code that reads requiredMap */
  const requiredMap = requiredMinMap
  const bannedSet = new Set(config.bannedActions)

  const MAX_NODES = 500_000
  const MAX_RESULTS = 5_000

  const baseParams = { charactersMap, characterColumnsMap, globalColumns, enemy }
  const results: CandidateSequence[] = []

  const requiredDesc = config.requiredActions.length === 0
    ? 'none'
    : config.requiredActions.map(r => {
        const max = r.maxCount !== undefined ? `–${r.maxCount}` : ''
        return `${r.action} ×${r.minCount}${max}`
      }).join(', ')
  const bannedCount = config.bannedActions.length
  const bannedDesc = bannedCount === 0 ? 'none' : `${bannedCount} actions — ${config.bannedActions.join(', ')}`

  console.group(`[Optimizer] ${character.name} — ${config.minDuration}s–${config.maxDuration}s, starting at t=${blockStartTime.toFixed(2)}s`)
  console.log(`Required : ${requiredDesc}`)
  console.log(`Banned   : ${bannedDesc}`)
  const enumerateStartMs = performance.now()
  let nodesVisited = 0
  let hitNodeLimit = false
  let hitResultsLimit = false
  const NODE_MILESTONES = [10_000, 50_000, 100_000, 250_000, 500_000]
  const RESULT_MILESTONES = [100, 500, 1_000, 2_500, 5_000]
  let nextNodeMilestone = 0
  let nextResultMilestone = 0

  function dfs(
    snapshots: Snapshot[],
    engineState: EngineState,
    steps: RotationStep[],
    satisfiedCounts: Map<string, number>,
  ) {
    if (hitNodeLimit || hitResultsLimit) return
    nodesVisited++
    if (nodesVisited >= MAX_NODES) {
      hitNodeLimit = true
      return
    }
    // Node milestone
    if (nextNodeMilestone < NODE_MILESTONES.length && nodesVisited >= NODE_MILESTONES[nextNodeMilestone]) {
      const elapsed = (performance.now() - enumerateStartMs).toFixed(0)
      console.log(`  ${(NODE_MILESTONES[nextNodeMilestone] / 1000).toFixed(0)}k nodes explored, ${results.length} candidates so far (${elapsed}ms)`)
      nextNodeMilestone++
    }
    const lastResolved = snapshots[snapshots.length - 2]
    const currentDuration = (lastResolved?.toTime ?? 0) - blockStartTime

    // Collect as a valid leaf if constraints are satisfied
    if (currentDuration >= config.minDuration && steps.length > 0) {
      const allRequiredSatisfied = requiredMap.size === 0 ||
        [...requiredMap.entries()].every(([r, n]) => (satisfiedCounts.get(r) ?? 0) >= n)
      if (allRequiredSatisfied) {
        results.push({
          steps: [...steps],
          terminalSnapshots: snapshots,
          terminalEngineState: engineState,
          blockDuration: currentDuration,
        })
        // Result milestone
        if (nextResultMilestone < RESULT_MILESTONES.length && results.length >= RESULT_MILESTONES[nextResultMilestone]) {
          const elapsed = (performance.now() - enumerateStartMs).toFixed(0)
          console.log(`  ${results.length} candidates found (${elapsed}ms)`)
          nextResultMilestone++
        }
        if (results.length >= MAX_RESULTS) {
          hitResultsLimit = true
          return
        }
      }
    }

    // Prune: no point going deeper if already at or past max duration
    if (currentDuration >= config.maxDuration) return

    // Get legal actions for this character from the current blank row's state
    const currentStateSnapshot = snapshots[snapshots.length - 1]
    const available = getAvailableActions(currentStateSnapshot, character).filter(action => {
      // Never allow swap-out actions — the character must stay on field during the block
      if (action.castConditions.requiresSwapOut) return false
      // Exclude Testing actions (Wait 0.05s, energy trackers, etc.) — they are not real choices
      if (action.category === 'Testing') return false
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

      // Track counts of required/capped actions used so far
      const newCounts = new Map(satisfiedCounts)
      const trackMinKey = requiredMinMap.has(action.name) ? action.name : (action.groupName !== undefined && requiredMinMap.has(action.groupName) ? action.groupName : null)
      const trackMaxKey = requiredMaxMap.has(action.name) ? action.name : (action.groupName !== undefined && requiredMaxMap.has(action.groupName) ? action.groupName : null)
      const countKey = trackMinKey ?? trackMaxKey
      if (countKey !== null) {
        newCounts.set(countKey, (newCounts.get(countKey) ?? 0) + 1)
      }

      // Prune: this action would exceed its maxCount cap
      const maxCapKey = requiredMaxMap.has(action.name) ? action.name : (action.groupName !== undefined && requiredMaxMap.has(action.groupName) ? action.groupName : null)
      if (maxCapKey !== null) {
        const nextCount = newCounts.get(maxCapKey) ?? 0
        if (nextCount > requiredMaxMap.get(maxCapKey)!) continue
      }

      const newStep: RotationStep = { character: character.name, action: action.name }
      dfs(newSnapshots, newEngine, [...steps, newStep], newCounts)
    }
  }

  dfs(cloneSnapshots(preBlockSnapshots), cloneEngineState(preBlockEngineState), [], new Map())

  const elapsed = (performance.now() - enumerateStartMs).toFixed(0)
  if (hitNodeLimit) console.warn(`Node limit (${MAX_NODES.toLocaleString()}) reached — results may be incomplete`)
  if (hitResultsLimit) console.warn(`Result limit (${MAX_RESULTS.toLocaleString()}) reached — results may be incomplete`)
  console.log(`Done: ${results.length} candidates from ${nodesVisited.toLocaleString()} nodes in ${elapsed}ms`)
  console.groupEnd()

  return results
}
