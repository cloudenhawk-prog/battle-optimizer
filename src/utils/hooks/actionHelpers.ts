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
 * If a formName is provided, checks if that form has a custom intro/outro action.
 */
export function getActionNameByDmgType(character: Character, dmgType: DamageType, formName?: string): string | undefined {
  // If a form name is specified and the character has forms, check for form-specific intro/outro
  if (formName && character.forms) {
    const form = character.forms.find(f => f.name === formName)
    if (form) {
      if (dmgType === 'INTRO' && form.introAction) {
        return form.introAction
      }
      if (dmgType === 'OUTRO' && form.outroAction) {
        return form.outroAction
      }
    }
  }

  // Fall back to default action with the specified damage type
  return character.actions.find(a => (a.dmgTypes as string[]).includes(dmgType))?.name
}
