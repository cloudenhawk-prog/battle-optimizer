import type { DamageModifier, InherentModifier } from '../../types/modifiers'
import { always, atLeastOneStackOf, ownerAtLeast } from '../../utils/conditions/damageModifierConditions'

// ========== S6 Liberation Inherent Modifier =================================================================================

// S6: Both liberations (Foreclaiming: Inward Vision and Foreclaiming: Blade Liberation) gain +500% Crit. DMG.
export const liberation_s6_crit_dmg: InherentModifier = {
  displayName: 'Liberation: S6 Crit DMG',
  characterStats: { critDamage: 5.00 },
  condition: (ctx) => ctx.character.sequence >= 6 ? 1 : 0,
}

// ========== S1 Basic Attack Multiplier ======================================================================================

// S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
// Modelled as a ×1.2 total multiplier since all Foreclaimed Self basic attacks
export const s1_foreclaimed_basic_multiplier: InherentModifier = {
  displayName: 'Foreclaimed BA: S1 Multiplier',
  characterStats: { totalMultiplierDMG: 2.2 },
  condition: (ctx) => ctx.character.sequence >= 1 ? 1 : 0,
}

// ========== Snow Rust ========================================================================================================

// At 1+ Snow Rust: Glacio Chafe DMG Amplified by 30%.
// At 3 Snow Rust:  Additional +30% (total 60%).
// targetStrategy 'all' ensures this applies to Glacio Chafe DoT ticks regardless of
// which resonator is active (collectAllModifiers picks up ally permanent 'all' modifiers).
export const snow_rust_1_3: DamageModifier = {
  source: 'Hiyuki: Fine Snow',
  displayName: 'Fine Snow: Glacio Chafe',
  type: 'buff',
  ownerCharacter: 'Hiyuki',
  color: '#dbe9ff',
  characterStats: { glacioChafeAmplifyDMG: 0.30 },
  condition: (ctx) => {
    const snowRust = ctx.current.charactersEnergies['Hiyuki']?.snow_rust ?? 0
    if (snowRust >= 3) return 2
    if (snowRust >= 1) return 1
    return 0
  },
  targetStrategy: 'all',
  durationStrategy: { type: 'permanent' },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
  description: '1 stack of Snow Rust: Glacio Bite DMG is Amplified by 30% against targets around the active Resonator. 3 stacks of Snow Rust: Glacio Bite DMG is additionally Amplified by 30% (60% total).',
  showStats: true,
}

// At 1+ Snow Rust: Hiyuki gains +40% Crit DMG (all sequences).
export const snow_rust_1: DamageModifier = {
  source: 'Hiyuki: Fine Snow',
  displayName: 'Fine Snow: Crit DMG (Self)',
  type: 'buff',
  ownerCharacter: 'Hiyuki',
  color: '#dbe9ff',
  characterStats: { critDamage: 0.40 },
  condition: (ctx) => {
    const snowRust = ctx.current.charactersEnergies['Hiyuki']?.snow_rust ?? 0
    return snowRust >= 1 ? 1 : 0
  },
  targetStrategy: 'self',
  durationStrategy: { type: 'permanent' },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
  description: "At 1+ Snow Rust: Hiyuki's Crit. DMG is increased by 40%.",
  showStats: true,
}

// ========== S6 Snow Rust: Crit DMG ===========================================================================================

// S6: Additional +40% Crit DMG at 2+ Snow Rust (stacks with the base modifier above for 80% total).
export const snow_rust_2_s6_self: DamageModifier = {
  source: 'Hiyuki: Fine Snow',
  displayName: 'Fine Snow: Crit DMG S6 (Self)',
  type: 'buff',
  ownerCharacter: 'Hiyuki',
  color: '#dbe9ff',
  characterStats: { critDamage: 0.40 },
  condition: (ctx) => {
    if (!ownerAtLeast('Hiyuki', 6)(ctx)) return 0
    const snowRust = ctx.current.charactersEnergies['Hiyuki']?.snow_rust ?? 0
    return snowRust >= 2 ? 1 : 0
  },
  targetStrategy: 'self',
  durationStrategy: { type: 'permanent' },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
  description: "[S6] At 2+ Snow Rust: Hiyuki's Crit. DMG is additionally increased by 40%.",
  showStats: true,
}

// S6: At 3+ Snow Rust: Total Glacio Bite DMG dealt by team is increased by 25%.
export const snow_rust_3_s6_team: DamageModifier = {
  source: 'Hiyuki: Fine Snow',
  displayName: 'Fine Snow: Glacio Bite (Team)',
  type: 'buff',
  ownerCharacter: 'Hiyuki',
  color: '#dbe9ff',
  characterStats: { glacioChafeTotalMultiplierDMG: 1.25 },
  condition: (ctx) => {
    if (!ownerAtLeast('Hiyuki', 6)(ctx)) return 0
    const snowRust = ctx.current.charactersEnergies['Hiyuki']?.snow_rust ?? 0
    return snowRust >= 3 ? 1 : 0
  },
  targetStrategy: 'all',
  durationStrategy: { type: 'permanent' },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
  description: '[S6] At 3+ Snow Rust: Total Glacio Bite DMG dealt by team is increased by 25%.',
  showStats: true,
}

// ========== S4 Shared Modifier ===============================================================================================
export const s4_skill_buff: DamageModifier = {
  source: 'Hiyuki: S4',
  displayName: 'Hiyuki S4 team buff',
  type: 'buff',
  ownerCharacter: 'Hiyuki',
  color: '#dbe9ff',
  characterStats: { bonusDMG: 0.20 },
  condition: always(),
  targetStrategy: 'all',
  durationStrategy: { type: 'limited', timeDuration: 30 },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
  description: '[S4] Casting Resonance Skill: Present Self, Frostblight: Jade Cleave, or Frostblight: Petalfall increases the damage dealt by all nearby Resonators in the team by 20% for 30s.',
}

// ========== Outro Buff =======================================================================================================
export const outro_buff: DamageModifier = {
  source: 'Hiyuki Outro Buff',
  displayName: 'Snowlight Blessing',
  type: 'buff',
  ownerCharacter: 'Hiyuki',
  characterStats: { glacioAmplifyDMG: 0.20 },
  condition: ctx => atLeastOneStackOf('Glacio Chafe')(ctx) ? 1 : 0,
  targetStrategy: 'allExceptSelf',
  durationStrategy: { type: 'limited', timeDuration: 20 },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
  color: '#FFD700',
  description: 'For 20 seconds: all Resonators except Hiyuki gain 20% Glacio DMG Amplification against targets affected by Glacio Chafe.',
  showStats: true
}
