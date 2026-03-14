import type { ResolvedCharacter } from '../types/character'
import { cartethyia } from './characters/cartethyia'
import { roverAero } from './characters/roverAero'
import { ciaccona } from './characters/ciaccona'
import { resolveCharacter } from '../utils/gear/resolveCharacter'

// ========== Characters =======================================================================================================

// Resolve gear contributions (stats, echo skills, injected modifiers) at startup.
// This must run before verifyData() and before any calculation code accesses character.stats.
export const characters: ResolvedCharacter[] = [cartethyia, ciaccona, roverAero].map(resolveCharacter)
