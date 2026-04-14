import type { Character } from '../../types/character'
import { all_actions } from '../actions/lucila/actions'
import { lucila_inherentStats, lucila_stats } from '../stats/lucila'

export const lucila: Character = {
  name: 'Lucila',
  element: 'GLACIO',
  weaponType: 'Rectifier',
  maxEnergies: {energy: 150, forte: 100, concerto: 100 },
  energyDescriptions: {
    energy: '',
    forte: '',
    concerto: ''
  },
  actions: [...all_actions],
  damageModifiers: [],
  stats: lucila_stats,
  inherentStats: lucila_inherentStats,
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
  sequence: 0,
  sequence_nodes: [
    // S1
    ``,

    // S2
    ``,
    
    // S3
    ``,
    
    // S4
    ``,
    
    // S5
    ``,
    
    // S6
    ``
  ],
  sequence_nodes_icons: [
    'assets/characters/sequences/lucila_1.png',
    'assets/characters/sequences/lucila_2.png',
    'assets/characters/sequences/lucila_3.png',
    'assets/characters/sequences/lucila_4.png',
    'assets/characters/sequences/lucila_5.png',
    'assets/characters/sequences/lucila_6.png',
  ],
  image: '/assets/characters/lucila.png',
}
