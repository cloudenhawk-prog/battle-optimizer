import type { Character } from '../../types/character'
import * as roverAeroActions from '../actions/roverAero'
import * as roverAeroTestActions from '../testActions/roverAero'
import { roverAero_form_base, roverAero_form_test } from '../forms/roverAero'
import { roverAeroStats } from '../stats/roverAero'

export const roverAero: Character = {
  name: 'Rover',
  actions: [...Object.values(roverAeroActions), ...Object.values(roverAeroTestActions)],
  maxEnergies: { energy: 150, concerto: 100, forte: 120 },
  stats: roverAeroStats,
  damageModifiers: [],
  forms: [roverAero_form_base, roverAero_form_test],
}
