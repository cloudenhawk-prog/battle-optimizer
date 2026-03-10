import type { Character } from '../../types/character'
import type { Action } from '../../types/action'

// ========== Form Helpers =====================================================================================================

/**
 * Gets the current form for a character based on the form name.
 * Returns the default form if formName is empty or not found.
 */
export function getCurrentForm(character: Character, formName?: string) {
  if (!character.forms || character.forms.length === 0) {
    return undefined
  }

  if (formName) {
    const form = character.forms.find(f => f.name === formName)
    if (form) return form
  }

  // Return default form or first form
  return character.forms.find(f => f.isDefault) ?? character.forms[0]
}

/**
 * Filters actions based on the character's current form.
 * If the form has availableActions defined, only those actions are shown.
 * If availableActions is undefined, all actions are available.
 */
export function getAvailableActionsForForm(character: Character, formName?: string): Action[] {
  const currentForm = getCurrentForm(character, formName)

  // If character has no forms, return all actions
  if (!currentForm) {
    return character.actions
  }

  // If form doesn't specify availableActions, all actions are available
  if (currentForm.availableActions === undefined) {
    return character.actions
  }

  // Filter actions based on form's availableActions
  // If availableActions is empty array, no actions are available (locked form)
  return character.actions.filter(action => currentForm.availableActions!.includes(action.name))
}

/**
 * Gets the default form name for a character.
 */
export function getDefaultFormName(character: Character): string {
  if (!character.forms || character.forms.length === 0) {
    return ''
  }

  const defaultForm = character.forms.find(f => f.isDefault) ?? character.forms[0]
  return defaultForm.name
}
