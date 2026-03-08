import type { Character } from '../../types/character'
import { roverAero_skill_1, roverAero_skill_1_cancel_with_swap, roverAero_skill_2, roverAero_skill_2_cancel_with_swap, roverAero_skill_3, roverAero_skill_3_cancel_with_swap_1, roverAero_skill_3_cancel_with_swap_2, roverAero_liberation, roverAero_midair_1_2, roverAero_midair_1_2_cancel_with_swap, roverAero_plunge, roverAero_plunge_cancel_with_swap, roverAero_BA_4, roverAero_BA_4_cancel_with_swap, roverAero_intro, roverAero_outro, roverAero_echo, roverAero_energy, roverAero_concerto, roverAero_forte } from '../actions/roverAero'
import { roverAeroStats } from '../stats/roverAero'

export const roverAero: Character = {
  name: 'Rover',
  actions: [roverAero_skill_1, roverAero_skill_1_cancel_with_swap, roverAero_skill_2, roverAero_skill_2_cancel_with_swap, roverAero_skill_3, roverAero_skill_3_cancel_with_swap_1, roverAero_skill_3_cancel_with_swap_2, roverAero_liberation, roverAero_midair_1_2, roverAero_midair_1_2_cancel_with_swap, roverAero_plunge, roverAero_plunge_cancel_with_swap, roverAero_BA_4, roverAero_BA_4_cancel_with_swap, roverAero_intro, roverAero_outro, roverAero_echo, roverAero_energy, roverAero_concerto, roverAero_forte, ],
  maxEnergies: { energy: 150, concerto: 100, forte: 120 },
  stats: roverAeroStats,
  damageModifiers: [],
}
