import type { Character } from '../../types/character'
import { always } from '../../utils/conditions/damageModifierConditions'
import * as ciacconaActions from '../actions/ciaccona'
import { ciaccona_cost_1_echo_1, ciaccona_cost_1_echo_2, ciaccona_cost_3_echo_1, ciaccona_cost_3_echo_2, ciaccona_cost_4_echo_1, ciaccona_set_bonus, ciaccona_weapon } from '../gear/ciaccona'
import { ciaccona_stats, ciaccona_inherentStats } from '../stats/ciaccona'

export const ciaccona: Character = {
  name: 'Ciaccona',
  maxEnergies: { energy: 125, concerto: 100, forte: 3 },
  actions: Object.values(ciacconaActions),
  damageModifiers: [
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
    setBonus: ciaccona_set_bonus
  }
}
