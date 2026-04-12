import type { ResolvedCharacter } from '../types/character'
import type { Character } from '../types/character'
import { mornye } from './characters/mornye'
import { resolveCharacter } from '../utils/gear/resolveCharacter'
import { hiyuki } from './characters/hiyuki'

// ========== Characters =======================================================================================================

// Original unresolved character definitions. Use these as the source of truth when
// re-resolving a character after a gear change: resolveCharacter(baseCharacters[i], newGear).
// Safe to use repeatedly since resolveCharacter is non-mutating.
export const baseCharacters: Character[] = [hiyuki, mornye]

// Resolve gear contributions (stats, echo skills, injected modifiers) at startup.
// This must run before verifyData() and before any calculation code accesses character.stats.
export const characters: ResolvedCharacter[] = baseCharacters.map(c => resolveCharacter(c))
