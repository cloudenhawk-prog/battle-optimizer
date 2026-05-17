import type { DamageModifier } from '../../types/modifiers'
import { always } from '../../utils/conditions/damageModifierConditions'

// ========== Liberation: Basic Attack DMG Buff (Clear As Day) =================================================================

// Casting Liberation grants Lucila +30% Basic Attack DMG Bonus for 10s.
// Dispatched to self only; also affects Oblivion since it is Basic Attack DMG type.
export const liberation_ba_dmg_buff: DamageModifier = {
  source: 'Lucila: Clear As Day',
  displayName: 'Clear As Day: Basic ATK Bonus',
  type: 'buff',
  ownerCharacter: 'Lucila',
  color: '#c5e8ff',
  characterStats: { basicBonusDMG: 0.30 },
  condition: always(),
  targetStrategy: 'self',
  durationStrategy: { type: 'limited', timeDuration: 10 },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
  description: 'Casting Clear As Day increases Lucila\'s Basic Attack DMG Bonus by 30% for 10s.',
  showStats: true,
}

// ========== Slow Motion: Glacio RES Debuff (Phantom Frame — Spotlight) =======================================================

// Casting Phantom Frame → Spotlight (Perfect Focus) reduces Glacio RES by 8% for 30s
// when in Resonance Mode - Glacio Chafe (always active for this build).
export const slow_motion_debuff: DamageModifier = {
  source: 'Lucila: Slow Motion',
  displayName: 'Slow Motion: Glacio RES Down',
  type: 'debuff',
  ownerCharacter: 'Lucila',
  color: '#a3d4f7',
  enemyStats: { glacioRES: -0.08 },
  condition: always(),
  targetStrategy: 'all',
  durationStrategy: { type: 'limited', timeDuration: 30 },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
  description: 'Phantom Frame (Perfect Focus): Glacio RES reduced by 8% for 30s.',
  showStats: true,
}

// ========== Outro: Montage — Glacio Chafe DMG Bonus =========================================================================

// Outro Skill: grants the whole team +60% Glacio Chafe DMG Bonus for 30s.
export const montage_outro_buff: DamageModifier = {
  source: 'Lucila Outro Buff',
  displayName: 'Montage',
  type: 'buff',
  ownerCharacter: 'Lucila',
  color: '#b8e0ff',
  characterStats: { glacioChafeBonusDMG: 0.60 },
  condition: always(),
  targetStrategy: 'all',
  durationStrategy: { type: 'limited', timeDuration: 30 },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
  description: 'Outro Skill - Montage: whole team gains +60% Glacio Chafe DMG Bonus for 30s.',
  showStats: true,
}
