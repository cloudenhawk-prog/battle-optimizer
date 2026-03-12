import type { Character } from '../../types/character'
import * as roverAeroActions from '../actions/roverAero'
import { roverAero_cost_1_echo_1, roverAero_cost_1_echo_2, roverAero_cost_3_echo_1, roverAero_cost_3_echo_2, roverAero_cost_4_echo_1, roverAero_set_bonus, roverAero_weapon } from '../gear/roverAero'
import { roverAero_inherentStats, roverAeroStats } from '../stats/roverAero'

export const roverAero: Character = {
  name: 'Rover',
  maxEnergies: { energy: 150, concerto: 100, forte: 120 },
  actions: Object.values(roverAeroActions),
  damageModifiers: [],
  stats: roverAeroStats,
  inherentStats: roverAero_inherentStats,
  gear: {
    weapon: roverAero_weapon,
    echoSlots: {
      1: roverAero_cost_4_echo_1,
      2: roverAero_cost_3_echo_1,
      3: roverAero_cost_3_echo_2,
      4: roverAero_cost_1_echo_1,
      5: roverAero_cost_1_echo_2
    },
    setBonus: roverAero_set_bonus
  }
}
