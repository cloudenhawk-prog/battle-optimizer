import type { Character } from '../../types/character'
import { always } from '../../utils/conditions/damageModifierConditions'
import { ciaccona_BA_3_4_cancel_with_E, ciaccona_BA_3_4_cancel_with_swap, ciaccona_midair_2_BA_4_cancel_with_E, ciaccona_midair_2_BA_4_cancel_with_swap, ciaccona_skill, ciaccona_skill_cancel_with_swap, ciaccona_liberation, ciaccona_heavy, ciaccona_heavy_cancel_with_swap, ciaccona_intro, ciaccona_outro, ciaccona_echo, ciaccona_energy, ciaccona_concerto, ciaccona_forte } from '../actions/ciaccona'
import { ciacconaStats } from '../stats/ciaccona'

export const ciaccona: Character = {
  name: 'Ciaccona',
  actions: [ciaccona_BA_3_4_cancel_with_E, ciaccona_BA_3_4_cancel_with_swap, ciaccona_midair_2_BA_4_cancel_with_E, ciaccona_midair_2_BA_4_cancel_with_swap, ciaccona_skill, ciaccona_skill_cancel_with_swap, ciaccona_liberation, ciaccona_heavy, ciaccona_heavy_cancel_with_swap, ciaccona_intro, ciaccona_outro, ciaccona_echo, ciaccona_energy, ciaccona_concerto, ciaccona_forte],
  maxEnergies: { energy: 125, concerto: 100, forte: 3 },
  stats: ciacconaStats,
  damageModifiers: [
    { source: 'Gusts of Welkin Team Buff', displayName: 'GoW Team Buff', type: 'buff', ownerCharacter: 'Ciaccona', condition: always(), characterStats: { aeroBonusDMG: 0.15 }, targetStrategy: 'all', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } },
    { source: 'Gusts of Welkin Self Buff', displayName: 'GoW Self Buff', type: 'buff', ownerCharacter: 'Ciaccona', condition: always(), characterStats: { aeroBonusDMG: 0.15 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } }
  ],
}
