// Mornye — Liberation "Critical Protocol": High Syntony Field buff, crit scaling from Energy Regen, S5/S6 multipliers.
import type { Action } from '../../../../../types/action'
import { always, ownerAtLeast } from '../../../../helpers/modifierConditions'
import { mode_mornye_heavy } from '../basics/heavy'

// ========== Mode: Liberation =======================================================================================================
export const mornye_liberation: Action = {
  tags: ['LIBERATION', 'HEAL_PROC'],
  name: 'Liberation',
  displayName: 'Critical Protocol',
  category: 'Skills',
  castTime: 0.01,
  multiplier: (522.33) / 100,
  scaling: 'DEF',
  elements: ['FUSION'],
  dmgTypes: ['LIBERATION'],
  cooldown: 25,
  energyGenerated: [
    { energyType: 'concerto', amount: 20, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 175 }],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Mornye: High Syntony Field',
      displayName: 'High Syntony Field',
      type: 'buff',
      color: '#FF2E3A',
      ownerCharacter: 'Mornye',
      characterStats: { bonusDEF: 0.2, offtuneBuildupRate: 0.5 },
      condition: always(),
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 25 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      healProc: {
        frequency: 3,
        procTag: 'HEAL_PROC',
        procModifiers: [],
      },
      activationCondition: (ctx) => ctx.modifiersInAction.some(mia => mia.modifier.source === 'Mornye: Syntony Field'),
      removesModifierSourceOnActivation: 'Mornye: Syntony Field',
      description: 'For 25 seconds: increases the DEF of all Resonators by 20% and Offtune Buildup Rate by 50%. Every 3 seconds, heals the active resonator.',
      showStats: true
    },
    {
      source: 'Mornye: High Syntony Field',
      displayName: 'High Syntony Field (S2)',
      type: 'buff',
      color: '#FF2E3A',
      ownerCharacter: 'Mornye',
      characterStats: { offtuneBuildupRate: 0.2 },
      condition: ownerAtLeast('Mornye', 2),
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 25 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      activationCondition: (ctx) => ctx.modifiersInAction.some(mia => mia.modifier.source === 'Mornye: Syntony Field'),
      contributionGroup: 'Mornye: High Syntony Field',
      description: 'High Syntony Field grants an additional 20% Offtune Buildup Rate to all Resonators',
      showStats: true
    },
  ],
  inherentModifiers: [
    {
      displayName: 'Liberation Crit Scaling',
      characterStats: { critRate: 0.005, critDamage: 0.01 },
      // +0.5% Crit Rate / +1% Crit DMG per 1% Energy Regen above 100% (capped at 160 points).
      condition: (ctx) => Math.min(Math.max(0, (ctx.character.stats.energyPercent - 1) * 100), 160),
    },
  ],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
    previousActions: [mode_mornye_heavy],
    requiredForms: ['Wide Field Observation Mode'] // Technically not true, but practically required
  },
  offtune: 7.20,
  attemptFollowUp: { actionName: 'Echo Skill', must: true },
  // S5: multiplier x1.4, S6: x5 (multiplicative).
  resolveVariant(_prevSnapshot, _characterName, owner) {
    const s5Multiplier = owner.sequence >= 5 ? 1.4 : 1
    const s6Multiplier = owner.sequence >= 6 ? 5 : 1
    const totalMultiplier = s5Multiplier * s6Multiplier
    if (totalMultiplier === 1) return { ...this, resolveVariant: undefined }
    return {
      ...this,
      multiplier: this.multiplier * totalMultiplier,
      resolveVariant: undefined,
    }
  },
}
