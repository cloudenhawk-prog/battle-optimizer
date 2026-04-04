import type { Character } from '../../types/character'
import { all_actions } from '../actions/hiyuki'
import { form_default, form_sakura } from '../forms/hiyuki'
import { hiyuki_cost_1_echo_1, hiyuki_cost_1_echo_2, hiyuki_cost_3_echo_1, hiyuki_cost_3_echo_2, hiyuki_cost_4_echo_1, hiyuki_set_bonus, hiyuki_weapon } from '../gear/hiyuki'
import { hiyuki_inherentStats, hiyuki_stats } from '../stats/hiyuki'

export const hiyuki: Character = {
  name: 'Hiyuki',
  element: 'GLACIO',
  weaponType: 'Sword',
  maxEnergies: {energy: 100, concerto: 100, forte: 100, unknown_energy: 100 }, // TODO
  actions: [...all_actions],
  damageModifiers: [],
  stats: hiyuki_stats,
  inherentStats: hiyuki_inherentStats,
  gear: {
    weapon: hiyuki_weapon,
    echoSlots:  {
      1: hiyuki_cost_4_echo_1,
      2: hiyuki_cost_3_echo_1,
      3: hiyuki_cost_3_echo_2,
      4: hiyuki_cost_1_echo_1,
      5: hiyuki_cost_1_echo_2
    },
    setBonus: hiyuki_set_bonus
  },
  defaultForm: 'Default', // TODO
  forms: [form_default, form_sakura],
  sequence: 6, // TODO
  sequence_nodes: [ // TODO
    'The DMG multipliers of Normal Attacks - Foreclaimed Self other than Frost Splinter: Foreclaimed Self are increased by 120%. Basic Attack - Foreclaimed Self Stage 3 now has an increased range and pulls enemies within range toward the center once.',
    'Frost Rite\'s DMG multiplier is increased by 110%. Agfter staying out of combat for more than 4s, the following effects are triggered: 1: Restore 3 points of SOMETHING. 2: Reset the cooldown of 2 charges of Frostblight: Jade Cleave. 3: Restore an additional 50 points of SOMETHING for the next 2 casts of Frostblight: Jade Cleave or Frostblight: Petalfall.',
    'Every 2s after joining the tam, gain 1 stack of Ringing Frost. The DMG multipliers of Rimeblade: Present Self and Rimeblade: Foreclaimed Self are increased by 120%. At 2 stacks of Ringing Frost, while Hiyuki is on the field, the DMG multiplier of the additional Negative Status applied each time she inflicts Glacio Chafe is increased by 488%.',
    'Casting Resonance Skill: Present Self, Frotblight: Jade Cleave, or Frostblight: Petalfall increases the damage dealt by all resonators in the team by 20% for 30s.',
    'The DMG multipliers of Resonance Skill - Present Self, Frostblight: Jade Cleave, and Frostblight: Petalfall are increased by 80%.',
    'The DMG multipliers of Foreclaiming: Inward Vision and Foreclaiming: Blade Liberation are increased by 150%. At 2 stacks of Ringing Frost, the effect \'While Hiyuki is on the field, each time she applies Glacio Chafe, she additionally deals an instance of Glacio Bite DMG\' changes to \'While Hiyuki is on the field, each time a resonator in the team applies Glacio Chafe, she additionally deals an instance of Glacio Bite DMG. At 2 stacks of Ringing Frost, the total Glacio Bite DMG enemies around the active resonator take is increased by 25%. At 3 stacks of Ringing Frost, Hiyuki\'s Crit DMG is increased by 40%. After staying out of combat for more than 4s, restore 3 points of SOMETHING.'
  ],
  sequence_nodes_icons: [ // TODO
    'assets/characters/sequences/hiyuki_1.png',
    'assets/characters/sequences/hiyuki_2.png',
    'assets/characters/sequences/hiyuki_3.png',
    'assets/characters/sequences/hiyuki_4.png',
    'assets/characters/sequences/hiyuki_5.png',
    'assets/characters/sequences/hiyuki_6.png',
  ],
  image: '/assets/characters/hiyuki.png', // TODO
}
