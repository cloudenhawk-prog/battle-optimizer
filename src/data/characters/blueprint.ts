import type { Character } from '../../types/character'

export const blueprint: Character = {
  name: 'XXX',
  element: '',
  maxEnergies: { energy: 100, concerto: 100, forte: 100 },
  actions: [],
  damageModifiers: [],
  stats: null,
  inherentStats: null,
  gear: {
    weapon: null,
    echoSlots:  {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null
    },
    setBonus: null
  },
  defaultForm: null, // Optional
  forms: [], // Optional
  sequence: 0,
  sequence_nodes: [],
  resourceMilestones: [] // Optional
}
