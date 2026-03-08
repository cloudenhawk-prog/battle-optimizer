import type { Character } from '../../types/character'
import { always, atLeastOneStackOf, stacksOf } from '../../utils/conditions/damageModifierConditions'
import { cartethyia_BA_1_4, cartethyia_BA_2_4, cartethyia_heavy, cartethyia_plunge_1, cartethyia_lunge_2, cartethyiaPlunge_3, cartethyia_skill, cartethyia_transform, fleurdelys_BA_1_5, fleurdelys_BA_3_5, fleurdelys_heavy_1, fleurdelys_heavy_2, fleurdelys_midair_1_3, fleurdelys_midair_1_2, fleurdelys_skill_1, fleurdelys_skill_2, fleurdelys_liberation, cartethyia_intro, cartethyia_outro, cartethyia_energy, cartethyia_concerto, cartethyia_forte, cartethyia_conviction, cartethyia_echo } from '../actions/cartethyia'
import { cartethyiaStats } from '../stats/cartethyia'

export const cartethyia: Character = {
  name: 'Cartethyia',
  actions: [cartethyia_BA_1_4, cartethyia_BA_2_4, cartethyia_heavy, cartethyia_plunge_1, cartethyia_lunge_2, cartethyiaPlunge_3, cartethyia_skill, cartethyia_transform, fleurdelys_BA_1_5, fleurdelys_BA_3_5, fleurdelys_heavy_1, fleurdelys_heavy_2, fleurdelys_midair_1_3, fleurdelys_midair_1_2, fleurdelys_skill_1, fleurdelys_skill_2, fleurdelys_liberation, cartethyia_intro, cartethyia_outro, cartethyia_echo, cartethyia_energy, cartethyia_concerto, cartethyia_forte, cartethyia_conviction],
  maxEnergies: { energy: 125, concerto: 100, forte: 3, conviction: 120 },
  stats: cartethyiaStats,
  damageModifiers: [
    { source: 'Inherent Skill', displayName: 'Aero Stacks', type: 'buff', ownerCharacter: 'Cartethyia', condition: stacksOf('Aero Erosion'), characterStats: { bonusDMG: 0.1 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } },
    { source: "Defier's Thorn", displayName: 'Defier Stack', type: 'buff', ownerCharacter: 'Cartethyia', condition: atLeastOneStackOf('Aero Erosion'), characterStats: { amplifyDMG: 0.2 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } },
    { source: "Defier's Thorn", displayName: 'Defier Ignore', type: 'buff', ownerCharacter: 'Cartethyia', condition: always(), characterStats: { defIgnore: 0.08 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } },
  ]
}
