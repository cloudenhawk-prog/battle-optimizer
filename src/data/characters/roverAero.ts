import type { Character } from '../../types/character'
import * as roverAeroActions from '../actions/roverAero'
import { roverAeroStats } from '../stats/roverAero'

export const roverAero: Character = {
  name: 'Rover',
  actions: Object.values(roverAeroActions),
  maxEnergies: { energy: 150, concerto: 100, forte: 120 },
  stats: roverAeroStats,
  damageModifiers: [],
}
