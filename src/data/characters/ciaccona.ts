import type { Character } from '../../types/character'
import { always } from '../../utils/conditions/damageModifierConditions'
import * as ciacconaActions from '../actions/ciaccona'
import { ciacconaStats } from '../stats/ciaccona'

export const ciaccona: Character = {
  name: 'Ciaccona',
  actions: Object.values(ciacconaActions),
  maxEnergies: { energy: 125, concerto: 100, forte: 3 },
  stats: ciacconaStats,
  damageModifiers: [
    { source: 'Gusts of Welkin Team Buff', displayName: 'GoW Team Buff', type: 'buff', ownerCharacter: 'Ciaccona', condition: always(), characterStats: { aeroBonusDMG: 0.15 }, targetStrategy: 'all', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } },
    { source: 'Gusts of Welkin Self Buff', displayName: 'GoW Self Buff', type: 'buff', ownerCharacter: 'Ciaccona', condition: always(), characterStats: { aeroBonusDMG: 0.15 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } }
  ],
}
