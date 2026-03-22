import type { Character } from '../../types/character'

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
  return character.forms.find(f => f.name === character.defaultForm) ?? character.forms[0]
}

/**
 * Gets the default form name for a character.
 */
export function getDefaultFormName(character: Character): string {
  if (!character.forms || character.forms.length === 0) {
    return ''
  }

  const defaultForm = character.forms.find(f => f.name === character.defaultForm) ?? character.forms[0]
  return defaultForm.name
}
