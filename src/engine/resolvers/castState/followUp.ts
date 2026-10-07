// Writes the combo follow-up state an action leaves behind: attemptFollowUp and restrictNextTo for the caster.
import type { StepContext } from '../../../types/stepContext'

// ========== Follow-Up State =================================================================================================

/** Both maps only ever hold the active character: any previous character's entry is dropped. */
export function writeFollowUpState(ctx: StepContext, charName: string): void {
  // Track follow-up actions for combo system
  // If this action has an attemptFollowUp, set it for the same character
  if (ctx.action.attemptFollowUp) {
    ctx.current.charactersAttemptFollowUp = {
      [charName]: {
        actionName: ctx.action.attemptFollowUp.actionName,
        // Default is false ("if possible") — must: true must be explicitly declared
        must: ctx.action.attemptFollowUp.must ?? false,
      },
    }
  } else {
    // Clear any previous follow-up for this character
    ctx.current.charactersAttemptFollowUp = {}
  }

  // Track restrictNextTo for combo system
  const restrictNextToValue = typeof ctx.action.restrictNextTo === 'function'
    ? ctx.action.restrictNextTo(ctx.prev, charName)
    : ctx.action.restrictNextTo
  if (restrictNextToValue?.length) {
    ctx.current.charactersRestrictNextTo = {
      [charName]: restrictNextToValue,
    }
  } else {
    ctx.current.charactersRestrictNextTo = {}
  }
}
