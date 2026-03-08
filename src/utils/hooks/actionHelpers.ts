import type { Character } from '../../types/character'
import type { DamageType } from '../../types/baseTypes'
import type { Snapshot } from '../../types/snapshot'
import { getCharacter } from './characterHelpers'

// ========== Action Helpers ===================================================================================================

export function getActionFromCharacter(charactersMap: Record<string, Character>, characterName: string, actionName: string, prevSnapshot?: Snapshot) {
  const character = getCharacter(charactersMap, characterName)
  if (!character) return undefined
  const action = character.actions.find(a => a.name === actionName)
  if (!action) return undefined
  if (action.resolveVariant) {
    return action.resolveVariant(prevSnapshot, characterName)
  }
  return action
}

/**
 * Finds the name of the first action that includes the given dmgType.
 * Used to look up outro/intro actions without relying on hardcoded names.
 */
export function getActionNameByDmgType(character: Character, dmgType: DamageType): string | undefined {
  return character.actions.find(a => (a.dmgTypes as string[]).includes(dmgType))?.name
}
