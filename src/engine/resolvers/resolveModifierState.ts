// R9 resolveModifierState: advances modifier timers by the cast time, expires them, and writes buff/debuff columns.
import type { StepContext } from '../../types/stepContext'
import { updateModifiersForTime } from '../modifiers/modifierHelpers'
import { updateModifierStacks } from '../modifiers/modifierStateHelpers'
import { clearForteGrantsForRemovedModifiers } from './forteGrants'

// ========== Resolver 9: Update Modifier State ===============================================================================

export function resolveModifierState(ctx: StepContext): void {
  // Capture active modifiers before time update to detect expiries
  const modifiersBefore = ctx.modifiersInAction

  // Update time-based modifiers
  ctx.modifiersInAction = updateModifiersForTime(ctx.modifiersInAction, ctx.fromTime, ctx.toTime)

  // Clear forteGrants for any modifier with clearsForteGrantsOnExpiry that just expired
  clearForteGrantsForRemovedModifiers(ctx, modifiersBefore)

  // Store modifier state in snapshot (includes both limited and permanent modifiers)
  updateModifierStacks(ctx.current, ctx.modifiersInAction, ctx.permanentModifiers, ctx)

  ctx.logs.push({
    resolver: 'resolveModifierState',
    message: 'Modifier state updated for time passage',
    details: {
      activeModifiers: ctx.modifiersInAction.length,
      permanentModifiers: ctx.permanentModifiers.length,
      modifiers: ctx.modifiersInAction.map(mia => ({
        name: mia.modifier.displayName,
        stacks: mia.currentStacks,
        timeLeft: mia.timeLeft === Infinity ? 'permanent' : `${mia.timeLeft}s`,
        swapsLeft: mia.swapsLeft === Infinity ? 'permanent' : mia.swapsLeft,
      })),
    },
  })
}
