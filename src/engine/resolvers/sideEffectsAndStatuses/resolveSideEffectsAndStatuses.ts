// R4 resolveSideEffectsAndStatuses: side-effect/trigger damage, negative-status ticks, buff stack edits, heal-proc ticks.
import type { StepContext } from '../../../types/stepContext'
import { aggregateStatusModifications } from './statusModifications'
import { helpSideEffectsDamage } from './sideEffectsDamage'
import { helpNegativeStatuses } from './negativeStatuses'
import { helpModifierStatusModifications } from './modifierStatusModifications'
import { helpHealProcModifiers } from './healProcs'

// ========== Resolver 4: Side Effects And Statuses ===========================================================================

// Order matters: side-effect damage may add propagated status modifications (e.g. Glacio Chafe stacks)
// that the negative-status update below must see; heal procs run last so a modifier removed this step
// by a status modification does not fire a final proc.
export function resolveSideEffectsAndStatuses(ctx: StepContext): void {
  // Aggregate all status modifications from both action and side effects
  const statusModifications = aggregateStatusModifications(ctx)

  // Side Effects Damage
  helpSideEffectsDamage(ctx, statusModifications)

  // Negative Statuses
  helpNegativeStatuses(ctx, statusModifications)

  // Buff/Debuff modifier stack modifications (e.g. an action forcefully ending a buff)
  helpModifierStatusModifications(ctx, statusModifications)

  // Tick periodic heal procs from active heal-proc modifiers (e.g. Syntony Field)
  helpHealProcModifiers(ctx)
}
