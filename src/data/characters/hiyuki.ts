import type { Character } from '../../types/character'
import { all_actions } from '../actions/hiyuki'
import { form_present_self, form_foreclaimed_self } from '../forms/hiyuki'
import { hiyuki_cost_1_echo_1, hiyuki_cost_1_echo_2, hiyuki_cost_3_echo_1, hiyuki_cost_3_echo_2, hiyuki_cost_4_echo_1, hiyuki_weapon } from '../gear/hiyuki'
import { hiyuki_inherentStats, hiyuki_stats } from '../stats/hiyuki'
import { hiyuki_glacio_chafe_proc, hiyuki_everfrost_dominion_glacio_bite } from '../sideEffects/sideEffects'

const hiyuki_sequence: Character['sequence'] = 6 // TODO

export const hiyuki: Character = {
  name: 'Hiyuki',
  element: 'GLACIO',
  weaponType: 'Sword',
  maxEnergies: {energy: 125, concerto: 100, dedication: 300, foreclaiming: 1, frostharden_iai: 3, frostheart: 300, whiteout_bitterfrost: 3, snowforged_blade: 3, snow_rust: 3, s1_enhanced_ba: 1, s2_frostheart_token: 2 }, // TODO
  energyDescriptions: {
    energy: 'Used to cast Foreclaimed: Liberation.',
    concerto: 'Used to cast Outro Skill and trigger Intro Skills',
    dedication: 'Spent on Enhanced Heavy Attack. Gained from Basic Attacks and Intro.',
    foreclaiming: 'Required to cast Foreclaiming: Inward Vision (liberation). Gained from Enhanced Heavy Attack.',
    frostharden_iai: 'Charges used to enhance the next Iai cast: grants 1 Whiteout Bitterfrost and inflicts Glacio Chafe.',
    frostheart: 'Required to cast Iai. Gained from Foreclaimed: BA, MA and Resonance Skill.',
    whiteout_bitterfrost: 'Required to cast Foreclaimed: Enhanced Heavy Attack. Gained from empowered Iai.',
    snowforged_blade: 'Empowers Foreclaiming: Blade Liberation. Gained from Foreclaimed: Enhanced Heavy Attack.',
    snow_rust: 'Passive amplification resource. Enables Fine Snow procs and buffs when at 1/2/3 stacks.',
    s1_enhanced_ba: '[S1] Token used to enhance the next BA1 and BA2 after Liberation to inflict Glacio Chafe.',
    s2_frostheart_token: '[S2] Token granting +50 Frostheart on the next cast of Frostblight: Jade Cleave or Frostblight: Petalfall.',
  },
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
      // At 2+ Snow Rust: Hiyuki gains +40% Crit DMG (all sequences).
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
      description: "At 2+ Snow Rust: Hiyuki's Crit. DMG is increased by 40%.",
      showStats: true,
    },
    {
      // S6: Additional +40% Crit DMG at 2+ Snow Rust (stacks with the base modifier above for 80% total).
      source: 'Hiyuki: Fine Snow',
      displayName: 'Fine Snow: Crit DMG S6 (Self)',
      type: 'buff',
      ownerCharacter: 'Hiyuki',
      color: '#dbe9ff',
      characterStats: { critDamage: 0.40 },
      condition: (ctx) => {
        if (hiyuki_sequence < 6) return 0
        const snowRust = ctx.current.charactersEnergies['Hiyuki']?.snow_rust ?? 0
        return snowRust >= 2 ? 1 : 0
      },
      targetStrategy: 'self',
      durationStrategy: { type: 'permanent' },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
      description: "[S6] At 2+ Snow Rust: Hiyuki's Crit. DMG is additionally increased by 40% (80% total with base).",
      showStats: true,
    },
    {
      // S6: At 2+ Snow Rust: Glacio Bite DMG for all nearby Resonators is increased by 25%.
      source: 'Hiyuki: Fine Snow',
      displayName: 'Fine Snow: Glacio Bite (Team)',
      type: 'buff',
      ownerCharacter: 'Hiyuki',
      color: '#dbe9ff',
      characterStats: { glacioChafeAmplifyDMG: 0.25 },
      condition: (ctx) => {
        if (hiyuki_sequence < 6) return 0
        const snowRust = ctx.current.charactersEnergies['Hiyuki']?.snow_rust ?? 0
        return snowRust >= 2 ? 1 : 0
      },
      targetStrategy: 'all',
      durationStrategy: { type: 'permanent' },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
      description: '[S6] At 2+ Snow Rust: Glacio Bite DMG for all nearby Resonators is increased by 25%.',
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
  sequence: hiyuki_sequence,
  // S3 hack: start at max Snow Rust instead of implementing periodic regen (1 stack every 2s).
  // Snowforged Blade: start with 1 point (S0-S5) or 3 points (S6) instead of using off-field triggers.
  // S2: start with 3 Frostharden Iai and 2 Frostheart tokens (one-time at battle start).
  startingEnergies: (seq) => ({
    ...(seq >= 3 ? { snow_rust: 3 } : {}),
    snowforged_blade: seq >= 6 ? 3 : 1,
    ...(seq >= 2 ? { frostharden_iai: 3, s2_frostheart_token: 2 } : {}),
  }),
  actionTriggers: [
    {
      // We may want to have names and icons for this and a placeto see actionTriggers and offFieldTriggers in the UI
      // At 2+ Snow Rust, while Hiyuki is on-field: every GLACIO_CHAFE_APPLIER cast fires a
      // 102% ATK Glacio hit using the full damage pipeline (crit, modifiers, RES, etc.).
      // Active at all sequence levels whenever snow_rust >= 2.
      requiredTags: ['GLACIO_CHAFE_APPLIER'],
      condition: (ctx) => (ctx.prev.charactersEnergies['Hiyuki']?.snow_rust ?? 0) >= 2,
      sideEffect: hiyuki_glacio_chafe_proc,
      // Fire once per application event of Glacio Chafe, not once per action cast.
      // Actions that aggregate multiple hit events set applicationCount on their
      // statusModification; single-application actions default to 1.
      fireCount: (ctx) =>
        (ctx.action.statusModifications ?? [])
          .filter(m => m.type === 'negativeStatus' && m.targetName === 'Glacio Chafe')
          .reduce((sum, m) => sum + (m.applicationCount ?? 1), 0),
    },
    {
      // Everfrost Dominion (S0–S5): while Hiyuki is on-field and below S6, every time Hiyuki
      // applies Glacio Chafe she deals a Glacio Chafe negative-status damage hit.
      // At S6 this is superseded by teamActionTriggers (Everfrost Dominion), which covers all team members.
      requiredTags: ['GLACIO_CHAFE_APPLIER'],
      condition: (ctx) => ctx.character.sequence < 6,
      sideEffect: hiyuki_everfrost_dominion_glacio_bite,
      // Fire once per application event (same pattern as above).
      fireCount: (ctx) =>
        (ctx.action.statusModifications ?? [])
          .filter(m => m.type === 'negativeStatus' && m.targetName === 'Glacio Chafe')
          .reduce((sum, m) => sum + (m.applicationCount ?? 1), 0),
    }
  ],
  teamActionTriggers: [
    {
      // S6 Everfrost Dominion: every time any Resonator on the team applies Glacio Chafe,
      // Hiyuki deals a Glacio Chafe negative-status damage hit at the current max stacks.
      // Fires regardless of whether Hiyuki or a teammate is the active character.
      // ctx.character is substituted to Hiyuki by the resolver, so dealer = "Hiyuki: ...".
      requiredTags: ['GLACIO_CHAFE_APPLIER'],
      condition: (ctx) => ctx.character.sequence >= 6,
      sideEffect: hiyuki_everfrost_dominion_glacio_bite,
      // Fire once per application event (same pattern as actionTriggers above).
      fireCount: (ctx) =>
        (ctx.action.statusModifications ?? [])
          .filter(m => m.type === 'negativeStatus' && m.targetName === 'Glacio Chafe')
          .reduce((sum, m) => sum + (m.applicationCount ?? 1), 0),
    }
  ],
  sequence_nodes: [ // TODO
    `The DMG Multipliers of
      Basic Attack - Foreclaimed Self,
      Heavy Attack - Foreclaimed Self,
      Mid-air Attack - Foreclaimed Self,
      Mid-air Plunging Attack - Foreclaimed Self,
      Dodge Counter - Foreclaimed Self
    are increased by 120%.
    Basic Attack - Foreclaimed Self Stage 3 now has an increased range and pulls enemies within range toward the center.
    Hiyuki is immune to interruptions while casting Basic Attack - Foreclaimed Self Stage 4 & 5.
    Casting Foreclaiming: Inward Vision enhances the next Basic Attack - Foreclaimed Self Stage 1 & 2, which now inflict 1 stack of Glacio Chafe on hit.`,

    `Iai\'s DMG Multiplier is increased by 140%.
    After staying out of combat for more than 4s, the following effects are triggered:
      1: Restore 3 points of Frostharden Iai.
      2: Reset the Cooldown of 2 charges of Frostblight: Jade Cleave.
      3: Restore an additional 50 points of Frostheart for the next 2 casts of Frostblight: Jade Cleave or Frostblight: Petalfall.`,
    
    `Every 2s after joining the team, gain 1 stack of Snow Rust.
    The DMG Multipliers of
      Frost Splinter: Present Self,
      Bitterfrost: Foreclaimed Self
    are increased by 120%.
    At 2 stacks of Snow Rust, while Hiyuki is on the field,
      the DMG Multiplier of the Glacio Bite DMG
      additionally applied each time she inflicts Glacio Chafe
    is increased by 488%.`,
    
    `Casting
      Resonance Skill: Present Self,
      Frostblight: Jade Cleave,
      Frostblight: Petalfall
    increases the damage dealt by all nearby Resonators in the team by 20% for 30s.
    Restore 18% of Max HP while casting Frostblight: Jade Cleave or Frostblight: Petalfall.`,
    
    `The DMG Multipliers of
      Resonance Skill - Present Self,
      Frostblight: Jade Cleave,
      Frostblight: Petalfall
    are increased by 80%.`,
    
    `The DMG Multipliers of
      Foreclaiming: Inward Vision,
      Foreclaiming: Blade Liberation
    are increased by 150%.
    At 2 stacks of Snow Rust, the effect
      "While Hiyuki is on the field, each time she applies Glacio Chafe, she additionally deals an instance of Glacio Bite DMG"
      changes to
      "While Hiyuki is on the field, each time a Resonator in the team applies Glacio Chafe, she additionally deals an instance of Glacio Bite DMG."
    At 2 stacks of Snow Rust,
      the total Glacio Bite DMG enemies within a certain range of the active Resonator take is increased by 25%.
      Hiyuki\'s Crit. DMG is increased by 40%.
      Inherent Skill Ephemeral Realm\'s effect is replaced: After staying out of combat for more than 4s, restore 3 points of Snowforged Blade.`
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
