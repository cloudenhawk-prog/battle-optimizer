// Explains why an action can't be cast from a given state (used when importing/replaying saved rotations).
import type { Action } from '../../types/action'
import type { ResolvedCharacter } from '../../types/character'
import type { Snapshot } from '../../types/snapshot'
import { getActionCooldownKey } from '../state/cooldownHelpers'

// ========== Failure Reason Detection =========================================================================================

/**
 * Returns a human-readable reason why `action` can't be cast after `prevSnapshot`, or null.
 * Checks, in order: must follow-up lock, energy, position, form, cooldown/stacks, customCanCast.
 * `ignoreCastConditions` skips energy, position, and customCanCast (not form/cooldown/follow-up);
 * `skipAllChecks` (sandbox mode) skips everything.
 *
 * NOTE: this is a subset of getAvailableActions' rules, and position is read raw from
 * charactersPositions (no swap-in inheritance), so it can disagree with the editor / MCTS.
 */

export function getActionFailureReason(action: Action, prevSnapshot: Snapshot | undefined, character: ResolvedCharacter, ignoreCastConditions: boolean, skipAllChecks = false): string | null {
  if (skipAllChecks) return null

  const charName = character.name

  // Must follow-up check (the action is locked until a specific follow-up is cast)
  if (prevSnapshot) {
    const followUpEntry = prevSnapshot.charactersAttemptFollowUp?.[charName]
    if (followUpEntry?.must) {
      const isThisTheFollowUp = action.name === followUpEntry.actionName || action.groupName === followUpEntry.actionName
      if (!isThisTheFollowUp) {
        return `Must cast "${followUpEntry.actionName}" as a required follow-up before "${action.displayName}"`
      }
    }
  }

  // Energy check
  if (!ignoreCastConditions) {
    const energies = prevSnapshot?.charactersEnergies?.[charName] ?? {}
    for (const cost of action.energyCost) {
      const current = energies[cost.energyType] ?? 0
      if (current < cost.amount) {
        return `Not enough ${cost.energyType} to cast "${action.displayName}" (need ${cost.amount}, have ${Math.round(current * 10) / 10})`
      }
    }
  }

  // Position check
  if (!ignoreCastConditions) {
    const position = prevSnapshot?.charactersPositions?.[charName] ?? 'GROUND'
    if (action.castConditions.startState !== 'ANY' && action.castConditions.startState !== position) {
      return `"${action.displayName}" requires ${action.castConditions.startState} position (currently ${position})`
    }
  }

  // Form check
  if (action.castConditions.requiredForms !== undefined) {
    const storedForm = prevSnapshot?.charactersForms?.[charName] ?? ''
    const resolvedForm =
      storedForm ||
      character.forms?.find(f => f.name === character.defaultForm)?.name ||
      character.forms?.[0]?.name ||
      ''
    if (action.castConditions.requiredForms.length === 0 || !action.castConditions.requiredForms.includes(resolvedForm)) {
      const required = action.castConditions.requiredForms.join(' or ')
      return `"${action.displayName}" requires ${required || 'unavailable'} form (currently ${resolvedForm || 'default'})`
    }
  }

  // Cooldown check
  const cooldownKey = getActionCooldownKey(action)
  const cooldownRemaining = prevSnapshot?.charactersCooldowns?.[charName]?.[cooldownKey] ?? 0
  if (cooldownRemaining > 0) {
    // For stacked actions, being on the recharge timer doesn't block casting — only empty stacks do
    if (action.maxStacks && action.maxStacks > 1) {
      const storedStacks = prevSnapshot?.charactersActionStacks?.[charName]?.[cooldownKey]
      const currentStacks = storedStacks ?? action.maxStacks
      if (currentStacks === 0) {
        return `"${action.displayName}" has no charges left (${cooldownRemaining.toFixed(1)}s until next charge)`
      }
    } else {
      return `"${action.displayName}" is on cooldown (${cooldownRemaining.toFixed(1)}s remaining)`
    }
  }

  if (!ignoreCastConditions) {
    // Custom cast condition
    if (action.castConditions.customCanCast && prevSnapshot) {
      if (!action.castConditions.customCanCast(prevSnapshot, charName)) {
        return `"${action.displayName}" cannot be cast at this point (a cast condition is not met)`
      }
    }
  }

  return null
}
