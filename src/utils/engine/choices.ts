import type { Action } from '../../types/action'
import type { ResolvedCharacter } from '../../types/character'
import type { Snapshot } from '../../types/snapshot'
import { getActionCooldownKey } from '../hooks/cooldownHelpers'
import { isActionCastableInState } from '../conditions/mustChainValidator'

// ========== Get Available Actions ============================================================================================

/**
 * Returns the list of actions the character can legally cast in the given snapshot state.
 *
 * Excluded unconditionally:
 *   - INTRO and OUTRO actions (triggered automatically, not user choices)
 *
 * Excluded when conditions are not met:
 *   - Energy unaffordable
 *   - On cooldown (stacked actions: blocked only when stacks = 0)
 *   - Wrong position (startState mismatch)
 *   - Wrong form (requiredForms mismatch)
 *
 * Must-chain lock:
 *   - If the previous action set a must:true follow-up for this character, only that
 *     specific action is returned.
 *
 * customCanCast is intentionally not evaluated here because it takes a snapshot reference
 * and may encode UI-specific logic. Callers that need it can filter further on their own.
 */
export function getAvailableActions(
  snapshot: Snapshot,
  character: ResolvedCharacter,
): Action[] {
  const charName = character.name

  // Resolve position and form from snapshot
  const position: 'GROUND' | 'AIR' = snapshot.charactersPositions?.[charName] ?? 'GROUND'
  const storedForm = snapshot.charactersForms?.[charName] ?? ''
  const form =
    storedForm ||
    character.forms?.find(f => f.name === character.defaultForm)?.name ||
    character.forms?.[0]?.name ||
    ''
  const energies = snapshot.charactersEnergies?.[charName] ?? {}

  const state = { position, form, energies }

  // Must-chain lock: if there is a must:true follow-up pending, only that action is available
  const followUpEntry = snapshot.charactersAttemptFollowUp?.[charName]
  if (followUpEntry?.must) {
    const locked = character.actions.find(
      a => a.name === followUpEntry.actionName || a.groupName === followUpEntry.actionName,
    )
    return locked ? [locked] : []
  }

  return character.actions.filter(action => {
    // Exclude INTRO / OUTRO — auto-triggered by the engine
    if ((action.dmgTypes as string[]).includes('INTRO') || (action.dmgTypes as string[]).includes('OUTRO')) {
      return false
    }

    // Cooldown check (stacked actions: blocked only when stacks = 0)
    const cooldownKey = getActionCooldownKey(action)
    const cooldownRemaining = snapshot.charactersCooldowns?.[charName]?.[cooldownKey] ?? 0
    if (action.maxStacks && action.maxStacks > 1) {
      const currentStacks = snapshot.charactersActionStacks?.[charName]?.[cooldownKey] ?? action.maxStacks
      if (currentStacks <= 0) return false
    } else if (cooldownRemaining > 0) {
      return false
    }

    // Position and form checks (energy is checked inside isActionCastableInState)
    return isActionCastableInState(action, state)
  })
}
