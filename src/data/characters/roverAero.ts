import type { Character } from '../../types/character'
import * as roverAeroActions from '../actions/roverAero'
import { roverAero_cost_1_echo_1, roverAero_cost_1_echo_2, roverAero_cost_3_echo_1, roverAero_cost_3_echo_2, roverAero_cost_4_echo_1, roverAero_set_bonus, roverAero_weapon } from '../gear/roverAero'
import { roverAero_inherentStats, roverAeroStats } from '../stats/roverAero'

export const roverAero: Character = {
  name: 'Rover',
  element: 'SPECTRO',
  weaponType: 'Sword',
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
  },
  sequence: 6,
  sequence_nodes: [
    'Casting Mid-air Attack Cloudburst Dance enhances Rover\'s resistance to interruption for 3s.',
    'Casting Resonance Skill Unbound Flow continuously restores HP for the Resonator on the field by 20% of Rover\'s ATK every 3s for 30s. When the Resonator on the field has an HP lower than 35%, immediately restore 10% of their lost HP. This restoration effect can be triggered once every 10s and will not be affected by any Healing Bonus.',
    'Aero DMG Bonus is increased by 15%.',
    'Casting Mid-air Attack Cloudburst Dance increases Resonance Skill DMG Bonus by 15% for 5s.',
    'The DMG Multiplier of Resonance Liberation Omega Storm is increased by 20%.',
    'The DMG Multiplier of Resonance Skill Unbound Flow is increased by 30%.'
  ],
  sequence_nodes_icons: [
    'assets/characters/sequences/roverAero_1.png',
    'assets/characters/sequences/roverAero_2.png',
    'assets/characters/sequences/roverAero_3.png',
    'assets/characters/sequences/roverAero_4.png',
    'assets/characters/sequences/roverAero_5.png',
    'assets/characters/sequences/roverAero_6.png',
  ],
  image: '/assets/characters/rover.png',
}
