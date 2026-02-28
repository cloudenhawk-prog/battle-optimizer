import type { Character } from "../../types/character"
import { roverAero_skill_1, roverAero_skill_2, roverAero_skill_3, roverAero_liberation, roverAero_midair_1_2, roverAero_plunge, roverAero_BA_4, roverAero_intro, roverAero_outro, roverAero_echo, roverAero_energy, roverAero_concerto, roverAero_forte } from '../actions/roverAero'
import { roverAeroStats } from '../stats/roverAero'

export const roverAero: Character = {
  name: 'Rover',
  actions: [roverAero_skill_1, roverAero_skill_2, roverAero_skill_3, roverAero_liberation, roverAero_midair_1_2, roverAero_plunge, roverAero_BA_4, roverAero_intro, roverAero_outro, roverAero_echo, roverAero_energy, roverAero_concerto, roverAero_forte],
  maxEnergies: { energy: 150, concerto: 100, forte: 120 },
  stats: roverAeroStats,
  damageModifiers: [],
}
