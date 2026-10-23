import type { Snapshot } from '../../types/snapshot'
import type { Character } from '../../types/character'
import type { Action } from '../../types/action'

// ========== Cooldown Helpers =================================================================================================

/**
 * Get the cooldown key for an action.
 * Actions in the same variant group (same groupName) share cooldowns.
 * Returns groupName if it exists, otherwise returns the action name.
 */
export function getActionCooldownKey(action: Action): string {
  return action.groupName || action.name
}

/**
 * Get the cooldown state for a specific character from a snapshot
 * Returns a record mapping action names to their remaining cooldown time
 */
export function getCharacterCooldowns(snapshot: Snapshot, characterName: string): Record<string, number> {
  if (!snapshot.charactersCooldowns) {
    return {}
  }
  return snapshot.charactersCooldowns[characterName] ?? {}
}

/**
 * Get the remaining cooldown time for a specific action
 * Returns 0 if the action is not on cooldown
 * Checks using the action's cooldown key (groupName or name)
 */
export function getActionCooldown(snapshot: Snapshot, characterName: string, action: Action): number {
  const cooldowns = getCharacterCooldowns(snapshot, characterName)
  const cooldownKey = getActionCooldownKey(action)
  return cooldowns[cooldownKey] ?? 0
}

/**
 * Check if an action is currently on cooldown
 */
export function isActionOnCooldown(snapshot: Snapshot, characterName: string, action: Action): boolean {
  return getActionCooldown(snapshot, characterName, action) > 0
}

/**
 * Update cooldowns for the time elapsed during an action
 * Reduces all cooldown timers by the elapsed time
 */
export function updateCooldownsForTime(snapshot: Snapshot, characterName: string, elapsedTime: number): Record<string, number> {
  const cooldowns = getCharacterCooldowns(snapshot, characterName)
  const updated: Record<string, number> = {}

  for (const [actionName, remainingTime] of Object.entries(cooldowns)) {
    const newTime = Math.max(0, remainingTime - elapsedTime)
    if (newTime > 0) {
      updated[actionName] = newTime
    }
    // If newTime is 0, we don't include it (cooldown expired)
  }

  return updated
}

/**
 * Set an action on cooldown after it's been used
 * Uses the action's cooldown key so variants share cooldowns
 */
export function setActionOnCooldown(snapshot: Snapshot, characterName: string, action: Action): Record<string, number> {
  const cooldowns = getCharacterCooldowns(snapshot, characterName)
  const updated = { ...cooldowns }

  if (action.cooldown > 0) {
    const cooldownKey = getActionCooldownKey(action)
    updated[cooldownKey] = action.cooldown
  }

  return updated
}

/**
 * Reduce the cooldown of a specific action by a given amount
 * Used for abilities that reduce cooldowns of other actions
 *
 * @param actionName - The cooldown key to reduce (can be action name or group name).
 *                     For variant actions, use the group name to affect all variants.
 */
export function reduceCooldown(snapshot: Snapshot, characterName: string, actionName: string, reduction: number): Record<string, number> {
  const cooldowns = getCharacterCooldowns(snapshot, characterName)
  const updated = { ...cooldowns }

  if (updated[actionName] !== undefined) {
    updated[actionName] = Math.max(0, updated[actionName] - reduction)
    if (updated[actionName] === 0) {
      delete updated[actionName]
    }
  }

  return updated
}

/**
 * Initialize cooldowns for all characters
 * Sets all cooldowns to 0 (ready to use)
 */
export function initializeCharactersCooldowns(characters: Character[]): Record<string, Record<string, number>> {
  const cooldowns: Record<string, Record<string, number>> = {}

  for (const character of characters) {
    cooldowns[character.name] = {}
  }

  return cooldowns
}

/**
 * Update all characters' cooldowns for elapsed time
 * Used when time passes in the rotation
 */
export function updateAllCharactersCooldowns(snapshot: Snapshot, characters: Character[], elapsedTime: number): Record<string, Record<string, number>> {
  const updated: Record<string, Record<string, number>> = {}

  for (const character of characters) {
    updated[character.name] = updateCooldownsForTime(snapshot, character.name, elapsedTime)
  }

  return updated
}
