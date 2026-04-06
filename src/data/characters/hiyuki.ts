import type { Character } from '../../types/character'
import { all_actions } from '../actions/hiyuki'
import { form_present_self, form_foreclaimed_self } from '../forms/hiyuki'
import { hiyuki_cost_1_echo_1, hiyuki_cost_1_echo_2, hiyuki_cost_3_echo_1, hiyuki_cost_3_echo_2, hiyuki_cost_4_echo_1, hiyuki_weapon } from '../gear/hiyuki'
import { hiyuki_inherentStats, hiyuki_stats } from '../stats/hiyuki'
import { hiyuki_glacio_chafe_proc } from '../sideEffects/sideEffects'

export const hiyuki: Character = {
  name: 'Hiyuki',
  element: 'GLACIO',
  weaponType: 'Sword',
  maxEnergies: {energy: 0, concerto: 100, dedication: 300, foreclaiming: 1, frostharden_iai: 3, frostheart: 300, whiteout_bitterfrost: 3, snowforged_blade: 3, snow_rust: 3 }, // TODO
  actions: [...all_actions],
  damageModifiers: [
    {
      // At 1+ Snow Rust: Glacio Chafe DMG Amplified by 30%.
      // At 3 Snow Rust:  Additional +30% (total 60%).
      // targetStrategy 'all' ensures this applies to Glacio Chafe DoT ticks regardless of
      // which resonator is active (collectAllModifiers picks up ally permanent 'all' modifiers).
      source: 'Hiyuki: Fine Snow',
      displayName: 'Fine Snow: Glacio Chafe',
      type: 'buff',
      ownerCharacter: 'Hiyuki',
      color: '#dbe9ff',
      characterStats: { glacioChafeAmplifyDMG: 0.30 },
      condition: (ctx) => {
        // Use ctx.current so the modifier display updates on the same step the energy is
        // generated. At damage-calculation time (resolveDamageModifiers) ctx.current still
        // holds the pre-action value (resolveResources hasn't run yet), so damage is
        // unaffected; only resolveModifierState (which runs after resolveResources) sees the
        // new value and correctly marks the buff as active.
        const snowRust = ctx.current.charactersEnergies['Hiyuki']?.snow_rust ?? 0
        if (snowRust >= 3) return 2   // 0.30 × 2 = 60%
        if (snowRust >= 1) return 1   // 0.30 × 1 = 30%
        return 0
      },
      targetStrategy: 'all',
      durationStrategy: { type: 'permanent' },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
      description: '1 stack of Snow Rust: Glacio Bite DMG is Amplified by 30% against targets around the active Resonator. 3 stacks of Snow Rust: Glacio Bite DMG is additionally Amplified by 30% (60% total).',
      showStats: true,
    },
    {
      // At 2+ Snow Rust: Hiyuki gains +40% Crit DMG.
      source: 'Hiyuki: Fine Snow',
      displayName: 'Fine Snow: Crit DMG (Self)',
      type: 'buff',
      ownerCharacter: 'Hiyuki',
      color: '#dbe9ff',
      characterStats: { critDamage: 0.40 },
      condition: (ctx) => {
        const snowRust = ctx.current.charactersEnergies['Hiyuki']?.snow_rust ?? 0
        return snowRust >= 2 ? 1 : 0
      },
      targetStrategy: 'self',
      durationStrategy: { type: 'permanent' },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
      description: "2 stacks of Snow Rust: Hiyuki's Crit. DMG is increased by 40%. While Hiyuki is on the field, each time she applies Glacio Chafe, she additionally deals an instance of Glacio Bite DMG equal to 102% of her ATK.",
      showStats: true,
    },
  ],
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
    setBonus: null
  },
  defaultForm: 'Present Self',
  forms: [form_present_self, form_foreclaimed_self],
  sequence: 6, // TODO
  offFieldTriggers: [
    {
      minOffFieldDuration: 4,
      condition: (snapshot, charName) => (snapshot.charactersEnergies[charName]?.snowforged_blade ?? 0) < 1,
      energyRestore: { snowforged_blade: 1 },
      description: 'When Hiyuki stays out of combat for more than 4s and has fewer than 1 point of Snowforged Blade, restore 1 point.',
    }
  ],
  actionTriggers: [
    {
      // At 2+ Snow Rust, while Hiyuki is on-field: every GLACIO_CHAFE_APPLIER cast fires a
      // 102% ATK Glacio hit using the full damage pipeline (crit, modifiers, RES, etc.).
      requiredTags: ['GLACIO_CHAFE_APPLIER'],
      condition: (ctx) => (ctx.prev.charactersEnergies['Hiyuki']?.snow_rust ?? 0) >= 2,
      sideEffect: hiyuki_glacio_chafe_proc,
    }
  ],
  sequence_nodes: [ // TODO
    'The DMG Multipliers of Basic Attack - Foreclaimed Self, Heavy Attack - Foreclaimed Self, Mid-air Attack - Foreclaimed Self, Mid-air Plunging Attack - Foreclaimed Self, Dodge Counter - Foreclaimed Self are increased by 120%. Basic Attack - Foreclaimed Self Stage 3 now has an increased range and pulls enemies within range toward the center. Hiyuki is immune to interruptions while casting Basic Attack - Foreclaimed Self Stage 4 & 5. Casting Foreclaiming: Inward Vision enhances the next Basic Attack - Foreclaimed Self Stage 1 & 2, which now inflict 1 stack of Glacio Chafe on hit.',
    'Iai\'s DMG Multiplier is increased by 140%. After staying out of combat for more than 4s, the following effects are triggered: 1: Restore 3 points of Frostharden Iai. 2: Reset the Cooldown of 2 charges of Frostblight: Jade Cleave. 3: Restore an additional 50 points of Frostheart for the next 2 casts of Frostblight: Jade Cleave or Frostblight: Petalfall.',
    'Every 2s after joining the team, gain 1 stack of Snow Rust. The DMG Multipliers of Frost Splinter: Present Self and Bitterfrost: Foreclaimed Self are increased by 120%. At 2 stacks of Snow Rust, while Hiyuki is on the field, the DMG Multiplier of the Glacio Bite DMG additionally applied each time she inflicts Glacio Chafe is increased by 488%.',
    'Casting Resonance Skill: Present Self, Frostblight: Jade Cleave, or Frostblight: Petalfall increases the damage dealt by all nearby Resonators in the team by 20% for 30s. Restore 18% of Max HP while casting Frostblight: Jade Cleave or Frostblight: Petalfall.',
    'The DMG Multipliers of Resonance Skill - Present Self, Frostblight: Jade Cleave, and Frostblight: Petalfall are increased by 80%.',
    'The DMG Multipliers of Foreclaiming: Inward Vision and Foreclaiming: Blade Liberation are increased by 150%. At 2 stacks of Snow Rust, the effect "While Hiyuki is on the field, each time she applies Glacio Chafe, she additionally deals an instance of Glacio Bite DMG" changes to "While Hiyuki is on the field, each time a Resonator in the team applies Glacio Chafe, she additionally deals an instance of Glacio Bite DMG." At 2 stacks of Snow Rust, the total Glacio Bite DMG enemies within a certain range of the active Resonator take is increased by 25%. Hiyuki\'s Crit. DMG is increased by 40%. Inherent Skill Ephemeral Realm\'s effect is replaced: After staying out of combat for more than 4s, restore 3 points of Snowforged Blade.'
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
