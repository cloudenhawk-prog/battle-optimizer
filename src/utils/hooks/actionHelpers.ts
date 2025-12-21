import type { Character } from "../../types/character"
import { getCharacter } from "./characterHelpers"

// ========== Action Helpers ===================================================================================================

export function getActionFromCharacter(
  charactersMap: Record<string, Character>,
  characterName: string,
  actionName: string
) {
  const character = getCharacter(charactersMap, characterName)
  if (!character) return undefined
  return character.actions.find(a => a.name === actionName)
}
