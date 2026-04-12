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
 *   - previousActions mismatch (last personal action is not in the allowed set)
 *   - customCanCast returns false
 *   - requiredComboTags / blockedComboTags mismatch
 *   - comboWindow expired, swap-broken, or form-change-broken
 *
 * Must-chain lock:
 *   - If the previous action set a must:true follow-up for this character, only that
 *     specific action is returned.
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

  const lastAction = snapshot.charactersLastAction?.[charName]
  const comboChainTags = snapshot.charactersComboChainTags?.[charName] ?? []

  return character.actions.filter(action => {
    // Exclude INTRO / OUTRO — auto-triggered by the engine
    if (action.tags?.includes('INTRO_ACTION') || action.tags?.includes('OUTRO_ACTION')) {
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

    // Position, form, energy
    if (!isActionCastableInState(action, state)) return false

    // previousActions: last personal action must be in the allowed set
    const previousActionsConstraint = action.castConditions.previousActions
    if (previousActionsConstraint?.length) {
      if (!previousActionsConstraint.some(pa => pa.name === lastAction)) return false
    }

    // customCanCast: custom runtime condition
    if (action.castConditions.customCanCast) {
      if (!action.castConditions.customCanCast(snapshot, charName)) return false
    }

    // requiredComboTags: ALL listed tags must be on the character's last personal action
    if (action.castConditions.requiredComboTags?.length) {
      if (!action.castConditions.requiredComboTags.every(tag => comboChainTags.includes(tag))) return false
    }

    // blockedComboTags: NONE of the listed tags may be on the character's last personal action
    if (action.castConditions.blockedComboTags?.length) {
      if (action.castConditions.blockedComboTags.some(tag => comboChainTags.includes(tag))) return false
    }

    // comboWindow: action must be cast within the allowed time window after a combo starter
    if (action.castConditions.comboWindow) {
      const comboWindow = action.castConditions.comboWindow
      const comboTracking = snapshot.charactersComboWindows?.[charName]

      if (!comboTracking) return false

      const matchingAction = comboWindow.previousActions.find(a => a.name === comboTracking.actionName)
      if (!matchingAction) return false

      let windowStartTime = comboTracking.startTime
      if (comboWindow.timerStartsAt === 'afterCast') windowStartTime += matchingAction.castTime

      const timeSinceCombo = snapshot.toTime - windowStartTime
      if (timeSinceCombo > comboWindow.maxTimeSincePrevious) return false
      if (comboWindow.crashesOnSwap && comboTracking.wasSwapped) return false
      if (comboWindow.crashesOnFormChange && comboTracking.formChanged) return false
    }

    return true
  })
}
