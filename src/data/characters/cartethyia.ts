import type { Character } from '../../types/character'
import { always, stacksOf } from '../../utils/conditions/damageModifierConditions'
import { all_actions } from '../actions/cartethyia'
import { form_cartethyia, form_fleurdelys } from '../forms/cartethyia'
import { cartethyia_cost_1_echo_1, cartethyia_cost_1_echo_2, cartethyia_cost_1_echo_3, cartethyia_cost_4_echo_1, cartethyia_cost_4_echo_2, cartethyia_set_bonus, cartethyia_weapon } from '../gear/cartethyia'
import { cartethyia_stats, cartethyia_inherentStats } from '../stats/cartethyia'

export const cartethyia: Character = {
  name: 'Cartethyia',
  element: 'AERO',
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
        color: '#17191a',
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
  sequence: 3,
  sequence_nodes: [
    'Gain Zeal that lasts for 10s when Cartethyia\'s or Fleurdelys\'s attacks directly damage and defeat targets inflicted with Aero Erosion. In the Zeal state, upon defeating enemies, the next move that directly damages targets raises the Aero Erosion stacks on the targets to the highest count among the targets defeated. This will not exceed the current max Aero Erosion stack limit. Zeal is removed afterward and enters a 1s cooldown. When Fleurdelys\'s Conviction hits 30/60/90/120, Fleurdelys\'s Crit. DMG is increased by 25% for 15s, up to 4 stacks. The duration of this effect does not reset upon gaining new stacks. After casting Resonance Liberation - Blade of Howling Squall, the increased Crit. DMG is removed.',
    'Casting Resonance Liberation - A Knight\'s Heartfelt Prayers increases the max stack limit of Aero Erosion on targets within a certain range by 3 stacks. The next attack that directly damages the target inflicts 3 stack of Aero Erosion on all targets within a certain range and immediately triggers the Aero Erosion DMG on the targets hit once without consuming the Aero Erosion stacks. The DMG Multipliers of Cartethyia\'s Basic Attack, Heavy Attack, Dodge Counter, and Intro Skill are increased by 50% and the DMG Multiplier of her Mid-air Attack is increased by 200%. After casting Mid-air Attack - Cartethyia, every 1 type of Sword Shadow recalled reduces the cooldown of Resonance Skill - Cartethyia by 1s.',
    'Basic Attack - Fleurdelys Stage 5, Mid-air Attack - Fleurdelys Stage 2, Enhanced Heavy Attack - Fleurdelys, and Resonance Skill - May Tempest Break the Tides now inflict 2 stacks of Aero Erosion on the targets hit. The DMG Multiplier of Resonance Liberation - Blade of Howling Squall is increased by 100%.',
    'After Resonators in the team inflict Havoc Bane, Fusion Burst, Spectro Frazzle, Electro Flare, Glacio Chafe, orAero Erosion, all Resonators in the team gain 20% DMG Bonus for all Attributes for 20s.',
    'When Cartethyia or Fleurdelys takes a fatal blow, they will not be downed by this instance of damage, but instead gain a Shield equal to 20% of Cartethyia\'s Max HP for 10s. This effect can be triggered once every 10 min. The HP cost for casting Resonance Liberation - A Knight\'s Heartfelt Prayers is reduced to 25% of Max HP.',
    'After casting Resonance Liberation - Blade of Howling Squall, raise the Aero Erosion stacks on the target hit to max. Casting Resonance Liberation - Blade of Howling Squall no longer removes the Aero Erosion stacks on the target. Within 30s after casting Intro Skill - Sword to Mark Tide\'s Trace, Intro Skill - Sword to Call for Freedom, Resonance Liberation - A Knight\'s Heartfelt Prayers, and Resonance Liberation - Blade of Howling Squall, when any Resonator in the team inflicts Aero Erosion on the targets with max stacks of Aero Erosion, immediately trigger the Aero Erosion DMG once. The targets take 40% more DMG from Fleurdelys.'
  ],
  sequence_nodes_icons: [
    'assets/characters/sequences/cartethyia_1.png',
    'assets/characters/sequences/cartethyia_2.png',
    'assets/characters/sequences/cartethyia_3.png',
    'assets/characters/sequences/cartethyia_4.png',
    'assets/characters/sequences/cartethyia_5.png',
    'assets/characters/sequences/cartethyia_6.png',
  ],
  image: '/assets/characters/cartehyia.png',
}
