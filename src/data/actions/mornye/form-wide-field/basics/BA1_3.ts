// Mornye — Wide Field Observation Mode: Basic Attack 1-3 (grants bonus concerto once per 20s).
import type { Action } from '../../../../../types/action'
import * as values from '../../values'

// ========== Mode: Basic Attack 1-3 ===========================================================================================
export const mode_mornye_BA_1_3: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Mode: Basic Attack 1-3',
  displayName: 'Mode: Basic Attack 1-3',
  category: 'Basics',
  castTime: 1.51,
  multiplier: values.MODE_BA1_multiplier + values.MODE_BA2_multiplier + values.MODE_BA3_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.MODE_BA1_energy + values.MODE_BA2_energy + values.MODE_BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.MODE_BA1_concerto + values.MODE_BA2_concerto + values.MODE_BA3_concerto, share: 0 },
    { energyType: 'relative_momentum', amount: values.MODE_BA1_relative_momentum + values.MODE_BA2_relative_momentum + values.MODE_BA3_relative_momentum, share: 0 }
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
  offtune: values.MODE_BA1_offtune + values.MODE_BA2_offtune + values.MODE_BA3_offtune,
  attemptFollowUp: { actionName: 'Mode: Resonance Skill', must: true },
  // Bonus 20 Concerto at most once per 20s: the first cast puts this action on a 20s cooldown, later casts
  // during that window resolve to the base version (no cooldown, no bonus).
  resolveVariant(prevSnapshot, characterName) {
    const bonusOnCooldown = (prevSnapshot?.charactersCooldowns?.[characterName]?.['Mode: Basic Attack 1-3'] ?? 0) > 0
    if (bonusOnCooldown) return { ...this, resolveVariant: undefined }
    return {
      ...this,
      cooldown: 20,
      energyGenerated: [
        ...this.energyGenerated,
        { energyType: 'concerto', amount: 20, share: 0 },
      ],
      resolveVariant: undefined,
    }
  }
}
