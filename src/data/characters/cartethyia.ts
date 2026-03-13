import type { Character } from '../../types/character'
import { stacksOf } from '../../utils/conditions/damageModifierConditions'
import { all_actions } from '../actions/cartethyia'
import { form_cartethyia, form_fleurdelys } from '../forms/cartethyia'
import { cartethyia_cost_1_echo_1, cartethyia_cost_1_echo_2, cartethyia_cost_1_echo_3, cartethyia_cost_4_echo_1, cartethyia_cost_4_echo_2, cartethyia_set_bonus, cartethyia_weapon } from '../gear/cartethyia'
import { cartethyia_stats, cartethyia_inherentStats } from '../stats/cartethyia'

export const cartethyia: Character = {
  name: 'Cartethyia',
  maxEnergies: { energy: 125, concerto: 100, forte: 3, conviction: 120 },
  actions: [...all_actions],
  damageModifiers: [{ source: 'Inherent Skill', displayName: 'Aero Stacks', type: 'buff', ownerCharacter: 'Cartethyia', condition: stacksOf('Aero Erosion'), characterStats: { bonusDMG: 0.1 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } }],
  stats: cartethyia_stats,
  inherentStats: cartethyia_inherentStats,
  defaultForm: 'Cartethyia',
  forms: [form_cartethyia, form_fleurdelys],
  gear: {
    weapon: cartethyia_weapon,
    echoSlots: {
      1: cartethyia_cost_4_echo_1,
      2: cartethyia_cost_4_echo_2,
      3: cartethyia_cost_1_echo_1,
      4: cartethyia_cost_1_echo_2,
      5: cartethyia_cost_1_echo_3
    },
    setBonus: cartethyia_set_bonus
  },
  sequence: 3
}
