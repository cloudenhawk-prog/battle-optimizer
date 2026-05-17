import type { Action } from '../../../../../types/action'
import * as values from '../../values'
import { slow_motion_debuff } from '../../../../modifiers/lucila'

// Phantom Frame → Spotlight: treated as one combined action (tab skill + perfect focus press).
// In Glacio Chafe mode: inflicts 1 extra Glacio Chafe stack and reduces Glacio RES by 8% (Slow Motion).
// Also recovers 20 additional Concerto from Spotlight mechanic (already included in skill_concerto).
// Restores 50 Traces (= 1 photo) from Spotlight.
const lucila_skill: Action = {
  tags: ['SKILL', 'GLACIO_CHAFE_APPLIER'],
  name: 'Resonance Skill',
  displayName: 'Phantom Frame — Spotlight',
  category: 'Skills',
  castTime: values.skill_castTime,
  multiplier: values.skill_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['SKILL'],
  cooldown: values.skill_cooldown,
  energyGenerated: [
    { energyType: 'energy', amount: values.skill_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.skill_concerto, share: 0 },
    { energyType: 'traces', amount: values.skill_traces, share: 0 },
  ],
  energyCost: [],
  statusModifications: [
    // 1 extra Glacio Chafe in Resonance Mode - Glacio Chafe
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 1 },
  ],
  damageModifiers: [slow_motion_debuff],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Default Form'],
  },
  offtune: values.skill_offtune,
  groupName: 'Resonance Skill',
  variantName: 'Default',
}

export { lucila_skill }
