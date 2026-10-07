// Mornye — Baseline Mode: Resonance Skill "Expectation Error", cast after a skill-cancelled basic attack chain, then forced into Heavy Attack.
import type { Action } from '../../../../../types/action'
import { mornye_BA_1_3_cancel_with_skill } from '../basics/BA1_3'
import { mornye_BA_2_3_cancel_with_skill } from '../basics/BA2_3'
import { mornye_BA_3_cancel_with_skill } from '../basics/BA3'

// ========== Resonance Skill ==================================================================================================
export const mornye_skill: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill',
  displayName: 'Expectation Error',
  category: 'Skills',
  castTime: 0.36,
  multiplier: 0,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['SKILL'],
  cooldown: 5,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Baseline Mode'],
    previousActions: [mornye_BA_1_3_cancel_with_skill, mornye_BA_2_3_cancel_with_skill, mornye_BA_3_cancel_with_skill]
  },
  offtune: 0,
  comboChainTags: ['BA1'],
  groupName: 'Resonance Skill',
  variantName: 'Default',
  attemptFollowUp: {actionName: 'Heavy Attack', must: true }
}
