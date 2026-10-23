// Sums the status modifications (buff/debuff/negative-status stack + duration edits) of an action and its side effects.
import type { StepContext } from '../../../types/stepContext'

// ========== Types ===========================================================================================================

export type StatusModificationTotals = { stackChange: number; durationChange: number; refreshDuration: boolean }

/** Totals keyed by modification type, then by target display name / status name. */
export type AggregatedStatusModifications = {
  buff: Record<string, StatusModificationTotals>
  debuff: Record<string, StatusModificationTotals>
  negativeStatus: Record<string, StatusModificationTotals>
}

// ========== Aggregate =======================================================================================================

/** Collects statusModifications from the action itself, then from each of its side effects (in that order). */
export function aggregateStatusModifications(ctx: StepContext): AggregatedStatusModifications {
  const aggregated: AggregatedStatusModifications = {
    buff: {},
    debuff: {},
    negativeStatus: {},
  }

  // Collect from action's statusModifications
  if (ctx.action.statusModifications) {
    for (const modification of ctx.action.statusModifications) {
      aggregateModification(aggregated, modification)
    }
  }

  // Collect from all side effects' statusModifications
  const sideEffects = ctx.action.sideEffects
  if (sideEffects && sideEffects.length > 0) {
    for (const sideEffect of sideEffects) {
      if (sideEffect.statusModifications) {
        for (const modification of sideEffect.statusModifications) {
          aggregateModification(aggregated, modification)
        }
      }
    }
  }

  ctx.logs.push({
    resolver: 'aggregateStatusModifications',
    message: 'Status modifications aggregated from action and side effects',
    details: { statusModifications: aggregated },
  })

  return aggregated
}

/** Adds one modification into the per-type, per-target totals (stack/duration deltas sum, refresh ORs). */
export function aggregateModification(
  aggregated: AggregatedStatusModifications,
  modification: {
    type: 'buff' | 'debuff' | 'negativeStatus'
    targetName: string
    stackChange?: number
    durationChange?: number
    refreshDuration?: boolean
  },
) {
  const { type, targetName, stackChange = 0, durationChange = 0, refreshDuration = false } = modification
  const container = aggregated[type]

  const entry = (container[targetName] ??= {
    stackChange: 0,
    durationChange: 0,
    refreshDuration: false,
  })

  entry.stackChange += stackChange
  entry.durationChange += durationChange
  entry.refreshDuration ||= refreshDuration
}
