// Clears forte grants owned by "anchor" modifiers (clearsForteGrantsOnExpiry) that disappeared this step.
import type { StepContext } from '../../types/stepContext'
import type { ModifierInAction } from '../../types/modifiers'

// ========== Clear Forte Grants ==============================================================================================

/**
 * For every anchor modifier in `modifiersBefore` whose source is no longer in ctx.modifiersInAction
 * (expired or explicitly removed), resets its owner's charactersForteGrants to [].
 */
export function clearForteGrantsForRemovedModifiers(ctx: StepContext, modifiersBefore: ModifierInAction[]): void {
  for (const mia of modifiersBefore) {
    if (!mia.modifier.clearsForteGrantsOnExpiry || !mia.modifier.ownerCharacter) continue
    const stillExists = ctx.modifiersInAction.some(m => m.modifier.source === mia.modifier.source)
    if (!stillExists) {
      if (!ctx.current.charactersForteGrants) ctx.current.charactersForteGrants = {}
      ctx.current.charactersForteGrants[mia.modifier.ownerCharacter] = []
    }
  }
}
