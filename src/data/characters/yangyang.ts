import type { CharacterData } from '../../types/character'
import { baseStats, inherentStats } from '../stats/yangyang'

export const yangyang: CharacterData = {
  name: 'Yangyang', // Can include 'display name' later if desired
  actions: [], // Can apply status modifications (give them types like buffs/debuffs - and also passive: permanent, timed, other types)
  maxEnergies: { energy: 100, concerto: 100, forte: 3 }, // Can be grabbed from liberation cost later
  baseStats: baseStats,
  inherentStats: inherentStats,
  gear: {
    weapon: null, // Equip weapon
    echoes: [],
  },
}

// TODO: define eapons, echoes
// TODO: the defined characters should use character data, like 'cartehyia: Character = someConvertFunction(characterData: CharacterData)'
// This function should use util function to add stats together / aggregate stats (make sure it works with partial stat objects)

// TODO NEXT: Fix the buff/debuff/damage modifier issue -> We need everything to be handled consistently. Some may be:
// Conditional apply / Universal
// Time-based / Permanent / Next N swaps Character(s) - for example self + 0 swap means (until I change character)
// Self / Current Active / Global
