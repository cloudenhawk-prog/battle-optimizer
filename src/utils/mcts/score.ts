import type { Snapshot } from '../../types/snapshot'

// ========== Type: Termination Goal ===========================================================================================

/**
 * Defines when a simulation rollout is considered complete.
 *  - 'time': stop when the last resolved snapshot's toTime reaches or exceeds `seconds`
 *  - 'damage': stop when cumulative damage reaches or exceeds `amount`
 */
export type TerminationGoal =
  | { type: 'time'; seconds: number }
  | { type: 'damage'; amount: number }

// ========== Helpers ==========================================================================================================

/**
 * Returns the last snapshot with real time data (toTime > 0).
 * The tail of the snapshot array is always a blank placeholder row, so this
 * scans backwards to find the most recently resolved row.
 */
export function getLastResolvedSnapshot(snapshots: Snapshot[]): Snapshot | null {
  for (let i = snapshots.length - 1; i >= 0; i--) {
    if (snapshots[i].toTime > 0) return snapshots[i]
  }
  return null
}

// ========== Terminal Check ===================================================================================================

export function isTerminal(snapshots: Snapshot[], goal: TerminationGoal): boolean {
  const last = getLastResolvedSnapshot(snapshots)
  if (!last) return false
  if (goal.type === 'time') return last.toTime >= goal.seconds
  return last.damage >= goal.amount
}

// ========== Score ============================================================================================================

/**
 * Returns the DPS score of the simulation state.
 * Only called on terminal nodes — reads from the last resolved snapshot.
 */
export function getScore(snapshots: Snapshot[]): number {
  const last = getLastResolvedSnapshot(snapshots)
  return last?.dps ?? 0
}