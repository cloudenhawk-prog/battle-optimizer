import type { CharacterData } from '../../types/character'
import { baseStats, inherentStats } from '../stats/cartethyia'

export const cartethyia: CharacterData = {
  name: 'Cartethyia',
  actions: [],
  maxEnergies: {},
  baseStats: baseStats,
  inherentStats: inherentStats,
  gear: {
    weapon: null,
    echoes: [],
  },
}
