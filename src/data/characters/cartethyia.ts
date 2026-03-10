import type { Character } from '../../types/character'
import { always, atLeastOneStackOf, stacksOf } from '../../utils/conditions/damageModifierConditions'
import * as cartethyiaActions from '../actions/cartethyia'
import { cartethyiaStats } from '../stats/cartethyia'

export const cartethyia: Character = {
  name: 'Cartethyia',
  actions: Object.values(cartethyiaActions),
  maxEnergies: { energy: 125, concerto: 100, forte: 3, conviction: 120 },
  stats: cartethyiaStats,
  damageModifiers: [
    { source: 'Inherent Skill', displayName: 'Aero Stacks', type: 'buff', ownerCharacter: 'Cartethyia', condition: stacksOf('Aero Erosion'), characterStats: { bonusDMG: 0.1 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } },
    { source: "Defier's Thorn", displayName: 'Defier Stack', type: 'buff', ownerCharacter: 'Cartethyia', condition: atLeastOneStackOf('Aero Erosion'), characterStats: { amplifyDMG: 0.2 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } },
    { source: "Defier's Thorn", displayName: 'Defier Ignore', type: 'buff', ownerCharacter: 'Cartethyia', condition: always(), characterStats: { defIgnore: 0.08 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } },
  ]
}
