import type { Character } from '../../types/character'
import { always, atLeastOneStackOf, stacksOf } from '../../utils/conditions/damageModifierConditions'
import { cartethyia_BA_1_4_cancel_with_E, cartethyia_BA_1_4_cancel_with_swap, cartethyia_BA_2_4, cartethyia_BA_2_4_cancel_with_jump, cartethyia_BA_2_4_cancel_with_swap, cartethyia_heavy, cartethyia_heavy_cancel_with_swap, cartethyia_intro, cartethyia_outro, cartethyia_echo } from '../actions/cartethyia'
import { cartethyiaStats } from '../stats/cartethyia'

export const cartethyia: Character = {
  name: 'Cartethyia',
  actions: [cartethyia_BA_1_4_cancel_with_E, cartethyia_BA_1_4_cancel_with_swap, cartethyia_BA_2_4, cartethyia_BA_2_4_cancel_with_jump, cartethyia_BA_2_4_cancel_with_swap, cartethyia_heavy, cartethyia_heavy_cancel_with_swap, cartethyia_intro, cartethyia_outro, cartethyia_echo],
  maxEnergies: { energy: 125, concerto: 100, forte: 3, conviction: 120 },
  stats: cartethyiaStats,
  damageModifiers: [
    { source: 'Inherent Skill', displayName: 'Aero Stacks', type: 'buff', ownerCharacter: 'Cartethyia', condition: stacksOf('Aero Erosion'), characterStats: { bonusDMG: 0.1 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } },
    { source: "Defier's Thorn", displayName: 'Defier Stack', type: 'buff', ownerCharacter: 'Cartethyia', condition: atLeastOneStackOf('Aero Erosion'), characterStats: { amplifyDMG: 0.2 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } },
    { source: "Defier's Thorn", displayName: 'Defier Ignore', type: 'buff', ownerCharacter: 'Cartethyia', condition: always(), characterStats: { defIgnore: 0.08 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } },
  ]
}
