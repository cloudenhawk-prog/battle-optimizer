import type { DamageModifier } from '../../types/modifiers'
import { always, ownerAtLeast } from '../../utils/conditions/damageModifierConditions'

// ========== Syntony Field ====================================================================================================

// Applied by Heavy Attack (Baseline Mode) and Intro Skill (both enter Wide Field Observation Mode).
// Triggers heal every 3 seconds (including on cast), activating echo 5-set effects.
// Off-tune Buildup Rate for all resonators: +50% base (+20% additionally at S2)
export const syntony_field: DamageModifier = {
  source: 'Mornye: Syntony Field',
  displayName: 'Syntony Field',
  type: 'buff',
  color: '#FFC247',
  ownerCharacter: 'Mornye',
  characterStats: { offtuneBuildupRate: 0.5 },
  condition: always(),
  targetStrategy: 'all',
  durationStrategy: { type: 'limited', timeDuration: 25 },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
  healProc: {
    frequency: 3,
    procTag: 'HEAL_PROC',
    procModifiers: [],
  },
  description: 'For 25 seconds: increases the Offtune Buildup Rate of all Resonators by 50%. Every 3 seconds, heals the active resonator.',
  showStats: true
}

// S2 bonus: +20% Off-tune Buildup Rate, active only when Mornye\'s sequence >= 2.
// Shares source with the base so Liberation\'s removesModifierSourceOnActivation clears both.
export const syntony_field_s2: DamageModifier = {
  source: 'Mornye: Syntony Field',
  displayName: 'Syntony Field (S2)',
  type: 'buff',
  color: '#FFC247',
  ownerCharacter: 'Mornye',
  characterStats: { offtuneBuildupRate: 0.2 },
  condition: ownerAtLeast('Mornye', 2),
  targetStrategy: 'all',
  durationStrategy: { type: 'limited', timeDuration: 25 },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
  contributionGroup: 'Mornye: Syntony Field',
  description: 'Syntony Field grants an additional 20% Offtune Buildup Rate to all Resonators',
  showStats: true
}
