import type { Character } from '../../types/character'
import { blueprint, blueprint_intro, blueprint_outro } from '../actions/blueprint'

export const XX: Character = {
  name: 'XXX',
  actions: [blueprint, blueprint_intro, blueprint_outro],
  maxEnergies: { energy: 100, concerto: 100, forte: 100 },
  stats: null,
  damageModifiers: []
}
