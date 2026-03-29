import type { Character } from '../../types/character'
import { always } from '../../utils/conditions/damageModifierConditions'
import * as ciacconaActions from '../actions/ciaccona'
import { ciaccona_cost_1_echo_1, ciaccona_cost_1_echo_2, ciaccona_cost_3_echo_1, ciaccona_cost_3_echo_2, ciaccona_cost_4_echo_1, ciaccona_set_bonus, ciaccona_weapon } from '../gear/ciaccona'
import { ciaccona_stats, ciaccona_inherentStats } from '../stats/ciaccona'

export const ciaccona: Character = {
  name: 'Ciaccona',
  element: 'ELECTRO',
  maxEnergies: { energy: 125, concerto: 100, forte: 3 },
  actions: Object.values(ciacconaActions),
  damageModifiers: [
    // TODO: Inject from echo into every action that applies aero erosion? Should be a timed buff
    { source: 'Gusts of Welkin Team Buff', displayName: 'GoW Team Buff', type: 'buff', ownerCharacter: 'Ciaccona', condition: always(), characterStats: { aeroBonusDMG: 0.15 }, targetStrategy: 'all', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } },
    { source: 'Gusts of Welkin Self Buff', displayName: 'GoW Self Buff', type: 'buff', ownerCharacter: 'Ciaccona', condition: always(), characterStats: { aeroBonusDMG: 0.15 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } }
  ],
  stats: ciaccona_stats,
  inherentStats: ciaccona_inherentStats,
  gear: {
    weapon: ciaccona_weapon,
    echoSlots: {
      1: ciaccona_cost_4_echo_1,
      2: ciaccona_cost_3_echo_1,
      3: ciaccona_cost_3_echo_2,
      4: ciaccona_cost_1_echo_1,
      5: ciaccona_cost_1_echo_2
    },
    setBonus: ciaccona_set_bonus,
  },
  sequence: 0,
  sequence_nodes: [
    'Casting Resonance Skill Harmonic Allegro grants Ciaccona immunity to interruption for 3s. Casting Basic Attack increases Ciaccona\'s ATK by 35% for 10s.',
    'During Resonance Liberation Singer\'s Triple Cadenza, Resonators in the team gain 40% Aero DMG Bonus.',
    'Casting Basic Attack Stage 4 additionally grants 1 segments of Musical Essence. Resonance Skill Harmonic Allegro gains 1 more charge.',
    'Ciaccona ignores 45% of the targets\' DEF when dealing damage with Heavy Attack Quadruple Downbeat; Ciaccona ignores 45% of the targets\' DEF when dealing Resonance Liberation DMG.',
    'Gain 40% Resonance Liberation DMG Bonus; DMG taken by Resonators within and around the range of Resonance Liberation Singer\'s Triple Cadenza is reduced by 30%.',
    'When in Solo Concert, Ciaccona or Ensemble Sylph deals Aero DMG equal to 220% of Ciaccona\'s ATK to nearby targets, considered Resonance Liberation DMG'
  ],
  sequence_nodes_icons: [
    'assets/characters/sequences/ciaccona_1.png',
    'assets/characters/sequences/ciaccona_2.png',
    'assets/characters/sequences/ciaccona_3.png',
    'assets/characters/sequences/ciaccona_4.png',
    'assets/characters/sequences/ciaccona_5.png',
    'assets/characters/sequences/ciaccona_6.png',
  ],
  image: '/assets/characters/ciaccona.png',
}
