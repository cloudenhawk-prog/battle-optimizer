// Linked modifiers: buffs that live exactly as long as their coordinated attack is active.
import type { CoordinatedAttack } from '../../types/coordinatedAttack'
import type { StepContext } from '../../types/stepContext'
import type { ModifierInAction } from '../../types/modifiers'

// ========== Linked Modifier Helpers =========================================================================================

/**
 * Ensures all linkedModifiers for a coordinated attack are present in ctx.modifiersInAction.
 * Called on both initial activation and refresh (re-cast). Does not duplicate if already present.
 */
export function ensureLinkedModifiersActive(ca: CoordinatedAttack, ctx: StepContext): void {
  for (const modifier of ca.linkedModifiers ?? []) {
    const alreadyPresent = ctx.modifiersInAction.some(
      mia => mia.modifier.source === modifier.source && mia.modifier.displayName === modifier.displayName,
    )
    if (!alreadyPresent) {
      ctx.modifiersInAction.push({
        modifier,
        applicationTime: ctx.toTime,
        timeLeft: Infinity,
        swapsLeft: Infinity,
        currentStacks: 1,
        targetCharacter: null,
      } satisfies ModifierInAction)
    }
  }
}

/**
 * Removes all linkedModifiers for a coordinated attack from ctx.modifiersInAction.
 * Called when the attack expires (time or swap-cancel).
 */
export function removeLinkedModifiers(ca: CoordinatedAttack, ctx: StepContext): void {
  if (!ca.linkedModifiers?.length) return
  const toRemove = new Set(ca.linkedModifiers.map(m => `${m.source}::${m.displayName}`))
  ctx.modifiersInAction = ctx.modifiersInAction.filter(
    mia => !toRemove.has(`${mia.modifier.source}::${mia.modifier.displayName}`),
  )
}
