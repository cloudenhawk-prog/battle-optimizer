// R11 resolveCastState: position, persistence, last action, follow-ups, forms, swap bookkeeping and combo windows.
import type { StepContext } from '../../../types/stepContext'
import { resolveNewPosition } from './position'
import { writeFollowUpState } from './followUp'
import { applyFormChange, resetLeavingCharacterForm } from './forms'
import { updateComboWindows } from './comboWindows'

// ========== Resolver 11: Cast State =========================================================================================

/**
 * Updates each character's resolved position, persistence window, and last-action tracking
 * after the current action completes. Runs last so it can read this step's final energies/forms.
 *
 * - charactersPositions: resolved to GROUND or AIR (PRESERVE/ANY keep the previous value)
 * - charactersPersistentUntil: absolute time until which the character persists on-field state
 *   after being swapped out (counted from fromTime, per the spec)
 * - charactersLastAction: the name of the last action this character cast; cleared for the
 *   active character if no persistenceTime is set AND the next step swaps away (handled by
 *   ActionSelect reading the persistence window rather than explicit clearing)
 */
export function resolveCastState(ctx: StepContext): void {
  const charName = ctx.character.name

  const prevCharName = ctx.prev.character

  // GROUND/AIR after this action (inherits the outgoing character's position on swap-in)
  const { prevPosition, rawEndState, newPosition } = resolveNewPosition(ctx)

  ctx.current.charactersPositions = {
    ...(ctx.prev.charactersPositions ?? {}),
    [charName]: newPosition,
  }

  // Track how long this character persists with their current state after swapping out
  const persistenceTime = ctx.action.castConditions.persistenceTime ?? 0
  ctx.current.charactersPersistentUntil = {
    ...(ctx.prev.charactersPersistentUntil ?? {}),
    [charName]: persistenceTime > 0 ? ctx.fromTime + persistenceTime : 0,
  }

  // Record this action as the character's last personal action
  ctx.current.charactersLastAction = {
    ...(ctx.prev.charactersLastAction ?? {}),
    [charName]: ctx.action.name,
  }

  // Record the combo chain tags produced by this action
  ctx.current.charactersComboChainTags = {
    ...(ctx.prev.charactersComboChainTags ?? {}),
    [charName]: ctx.action.comboChainTags ?? [],
  }

  // Track whether this character must swap out after this action
  ctx.current.charactersRequiresSwapOut = {
    [charName]: ctx.action.castConditions.requiresSwapOut ?? false,
  }

  // Track follow-up actions for combo system (attemptFollowUp + restrictNextTo)
  writeFollowUpState(ctx, charName)

  // Handle form changes if this action changes the character's form
  applyFormChange(ctx, charName)

  // Handle swap cooldown: when a different character takes over, the previous character
  // cannot be swapped back in for 1 second (measured from the start of the current action).
  const swapOccurred = !!prevCharName && prevCharName !== charName
  ctx.current.charactersSwapCooldownUntil = {
    ...(ctx.prev.charactersSwapCooldownUntil ?? {}),
    ...(swapOccurred ? { [prevCharName!]: ctx.fromTime + 1 } : {}),
  }

  // Track when each character goes off-field so off-field duration triggers can fire.
  // On swap: the leaving character records the absolute time they went off-field.
  // The arriving character is cleared to null (= currently on-field).
  // null means "on-field / no off-field tracking" — 0 is a valid timestamp (start of rotation).
  ctx.current.charactersOffFieldSince = {
    ...(ctx.prev.charactersOffFieldSince ?? {}),
    ...(swapOccurred ? { [prevCharName!]: ctx.fromTime, [charName]: null } : {}),
  }

  const swapCooldownUntil = swapOccurred && prevCharName ? ctx.current.charactersSwapCooldownUntil[prevCharName] : undefined

  // On swap-out: reset the leaving character's form to default and clear any form-specific energies
  if (swapOccurred && prevCharName) {
    resetLeavingCharacterForm(ctx, prevCharName)
  }

  // Handle combo windows: track actions that can start time-based combo chains
  updateComboWindows(ctx, charName, swapOccurred, prevCharName)

  ctx.logs.push({
    resolver: 'resolveCastState',
    message: `Cast state resolved for ${charName}: position=${newPosition}, persistentUntil=${ctx.current.charactersPersistentUntil[charName]}`,
    details: { prevPosition, rawEndState, newPosition, persistenceTime, swapOccurred, swapCooldownUntil },
  })
}
