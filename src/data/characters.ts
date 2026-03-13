import type { Character } from '../types/character'
import { cartethyia } from './characters/cartethyia'
import { roverAero } from './characters/roverAero'
import { ciaccona } from './characters/ciaccona'
import { resolveCharacter } from '../utils/gear/resolveCharacter'

// ========== Characters =======================================================================================================

const _characters: Character[] = [cartethyia, ciaccona, roverAero]

// Resolve gear contributions (stats, echo skills, injected modifiers) at startup.
// This must run before verifyData() and before any calculation code accesses character.stats.
for (const character of _characters) {
  resolveCharacter(character)
}

export const characters: Character[] = _characters
