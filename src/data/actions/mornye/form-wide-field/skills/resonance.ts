// Mornye — Wide Field Observation Mode: Resonance Skill "Distributed Array" (S3 adds resource refunds).
import type { Action } from '../../../../../types/action'

// ========== Mode: Resonance Skill ============================================================================================
export const mode_mornye_skill: Action = {
  tags: ['SKILL', 'HEAL_PROC'],
  name: 'Mode: Resonance Skill',
  displayName: 'Distributed Array',
  category: 'Skills',
  castTime: 1.05,
  multiplier: (4 * 39.77) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['SKILL'],
  cooldown: 16,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 4.63, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'relative_momentum', amount: 60, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
    preventsSwapOut: true,
    requiredForms: ['Wide Field Observation Mode']
  },
  offtune: 4 * 0.20,
  attemptFollowUp: { actionName: 'Mode: Heavy Attack', must: true },
  // S3: refunds 25 Concerto + 100 Relative Momentum, gated by a shared 25s cooldown key.
  resolveVariant(_prevSnapshot, _characterName, owner) {
    if (owner.sequence < 3) return { ...this, resolveVariant: undefined }
    return {
      ...this,
      energyGenerated: [
        ...this.energyGenerated,
        { energyType: 'concerto', amount: 25, share: 0, cooldownKey: 'Mornye S3: Distributed Array', cooldownDuration: 25 },
        { energyType: 'relative_momentum', amount: 100, share: 0, cooldownKey: 'Mornye S3: Distributed Array', cooldownDuration: 25 },
      ],
      resolveVariant: undefined,
    }
  },
}
