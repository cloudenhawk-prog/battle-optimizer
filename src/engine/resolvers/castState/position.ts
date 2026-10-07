// Works out the active character's GROUND/AIR position after this action (inherit on swap-in, honour persistence).
import type { StepContext } from '../../../types/stepContext'
import type { Position } from '../../../types/baseTypes'

// ========== Resolve Position ================================================================================================

export type PositionResult = {
  prevPosition: 'GROUND' | 'AIR'
  rawEndState: Position
  newPosition: 'GROUND' | 'AIR'
}

/**
 * Determine the new resolved position for the active character.
 * For swap-cancel variants, swapOutState overrides endState (it's the position the character
 * lands in after being swapped out mid-action). Falls back to endState for all other actions.
 * Position source priority:
 *   1. Swapping in while own persistence window is still active → use own stored position
 *      (character lingered on-field after a swap-cancel, their position was preserved)
 *   2. Swapping in normally → inherit the outgoing character's position
 *      (incoming character lands wherever the field currently is)
 *   3. Same character continuing → use own stored position
 *
 * castRules/availableActions mirrors this rule when offering actions; keep the two in sync.
 */
export function resolveNewPosition(ctx: StepContext): PositionResult {
  const charName = ctx.character.name
  const storedPosition = ctx.prev.charactersPositions?.[charName]
  const prevCharName = ctx.prev.character
  const isSwappingIn = !!prevCharName && prevCharName !== charName
  const persistentUntil = ctx.prev.charactersPersistentUntil?.[charName] ?? 0
  const isLingeringActive = isSwappingIn && persistentUntil > ctx.fromTime

  // Use this character's own stored position only while their persistence window is still
  // active (i.e. they lingered on-field after a swap-cancel). In all other cases inherit
  // from the outgoing character — the incoming character lands wherever the field currently is.
  const prevPosition: 'GROUND' | 'AIR' = isLingeringActive
    ? (storedPosition ?? 'GROUND')
    : isSwappingIn
      ? (ctx.prev.charactersPositions?.[prevCharName] ?? 'GROUND')
      : (storedPosition ?? 'GROUND')
  const rawEndState = ctx.action.castConditions.swapOutState ?? ctx.action.castConditions.endState
  const newPosition: 'GROUND' | 'AIR' = rawEndState === 'PRESERVE' || rawEndState === 'ANY' ? prevPosition : (rawEndState as 'GROUND' | 'AIR')

  return { prevPosition, rawEndState, newPosition }
}
