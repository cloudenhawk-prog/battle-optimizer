// Activates (or refreshes) the coordinated attacks declared on the cast action, plus their linked modifiers.
import type { StepContext } from '../../types/stepContext'
import { ensureLinkedModifiersActive } from './linkedModifiers'

// ========== Activate ========================================================================================================

/**
 * Inspect the current action and activate (or refresh) any coordinated attacks it defines.
 * New entries are pushed directly onto ctx.coordinatedAttacksInAction and existing ones are
 * refreshed in place, so the caller's EngineState array/entries are mutated too.
 */
export function activateCoordinatedAttacks(ctx: StepContext): void {
  for (const ca of ctx.action.coordinatedAttacks ?? []) {
    const existing = ctx.coordinatedAttacksInAction.find(
      caia => caia.coordinatedAttack.name === ca.name && caia.ownerCharacter === ctx.character.name,
    )

    if (existing) {
      // Refresh: reset duration and last-damage anchor to the end of this cast
      existing.applicationTime = ctx.toTime
      existing.timeLeft = ca.duration
      existing.lastDamageTime = ctx.toTime
      ensureLinkedModifiersActive(ca, ctx)
    } else {
      ctx.coordinatedAttacksInAction.push({
        coordinatedAttack: ca,
        ownerCharacter: ctx.character.name,
        applicationTime: ctx.toTime,
        timeLeft: ca.duration,
        lastDamageTime: ctx.toTime,
      })
      ensureLinkedModifiersActive(ca, ctx)
    }
  }
}
