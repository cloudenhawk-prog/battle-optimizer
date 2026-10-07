// Negative-status (DoT) ticking and stack updates for one step.
import type { StepContext } from '../../../types/stepContext'
import { getNegativeStatusStacks, processNegativeStatusStacks, updateNegativeStatusStacks } from '../../negativeStatuses/negativeStatusHelpers'

// ========== Negative Statuses ===============================================================================================

/**
 * Ticks every active negative status over [fromTime, toTime] (DoT damage), then applies this step's
 * negative-status stack/duration modifications and writes the result into the row.
 */
export function helpNegativeStatuses(ctx: StepContext, statusModifications: any): void {
  const prev = ctx.prev
  const current = ctx.current
  const negativeStatusesInAction = ctx.negativeStatusesInAction
  const fromTime = ctx.fromTime
  const toTime = ctx.toTime
  const enemy = ctx.enemy
  const action = ctx.action

  const stacksPrev = getNegativeStatusStacks(prev)
  const { damageEvents, stacksCurr } = processNegativeStatusStacks(negativeStatusesInAction, fromTime, toTime, stacksPrev, enemy, ctx.character.stats, ctx.aggregatedCharacterModifiers, ctx.aggregatedEnemyModifiers, ctx.damageModifiers, ctx.snapshotId, ctx)
  updateNegativeStatusStacks(current, stacksCurr, action, negativeStatusesInAction, statusModifications.negativeStatus, ctx)

  // Collect all damage events and filter out zero-damage events
  const allDamageEvents = Object.values(damageEvents)
    .flat()
    .filter(event => event.average > 0)
  ctx.damageEvents.push(...allDamageEvents)

  // Calculate total damage from all events
  const totalDmgNegativeStatuses = allDamageEvents.reduce((sum, event) => sum + event.average, 0)
  current.damage += totalDmgNegativeStatuses

  ctx.logs.push({
    resolver: 'resolveNegativeStatuses',
    message: `Negative statuses resolved: +${totalDmgNegativeStatuses} dmg`,
    details: { damageEventsCount: allDamageEvents.length, totalDamage: totalDmgNegativeStatuses, damageEvents: allDamageEvents },
  })
}
