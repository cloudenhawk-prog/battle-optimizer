import type { Character } from '../../types/character'
import { always, stacksOf } from '../../utils/conditions/damageModifierConditions'
import { all_actions } from '../actions/cartethyia'
import { form_cartethyia, form_fleurdelys } from '../forms/cartethyia'
import { cartethyia_cost_1_echo_1, cartethyia_cost_1_echo_2, cartethyia_cost_1_echo_3, cartethyia_cost_4_echo_1, cartethyia_cost_4_echo_2, cartethyia_set_bonus, cartethyia_weapon } from '../gear/cartethyia'
import { cartethyia_stats, cartethyia_inherentStats } from '../stats/cartethyia'

export const cartethyia: Character = {
  name: 'Cartethyia',
  maxEnergies: { energy: 125, concerto: 100, forte_divinity: 1, forte_discord: 1, forte_virtue: 1, conviction: 120 },
  actions: [...all_actions],
  damageModifiers: [{ source: 'Inherent Skill', displayName: 'Wind\'s Indelible Imprint', type: 'buff', ownerCharacter: 'Cartethyia', condition: stacksOf('Aero Erosion'), characterStats: { bonusDMG: 0.1 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 } }],
  // When Cartethyia/Fleurdelys's Conviction hits 30/60/90/120, Cartethyia/Fleurdelys's Crit. DMG is increased by 25% for 15s, up to 4 stacks. The duration of this effect does not reset upon gaining new stacks. After casting Resonance Liberation - Blade of Howling Squall, the increased Crit. DMG is removed.
  resourceMilestones: [ // Problem: this should technically be part of "Mandate" buff. When we calculate modifier contributions, this might not count towards mandate's contributions (DataOverlay)
    {
      resourceType: 'conviction',
      milestones: [30, 60, 90, 120],
      modifier: {
        source: 'Cartethyia S1: Conviction Milestone',
        displayName: "Fleurdelys's Conviction",
        type: 'buff',
        ownerCharacter: 'Cartethyia',
        color: '#87ceeb',
        characterStats: { critDamage: 0.25 },
        condition: always(),
        targetStrategy: 'self',
        durationStrategy: { type: 'limited', timeDuration: 15 },
        stackingStrategy: { maxStacks: 4, resetTimerOnApplication: false, stacksRemovedEachTime: 4 },
        contributionGroup: 'Cartethyia: Mandate',
      },
    },
  ],
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
