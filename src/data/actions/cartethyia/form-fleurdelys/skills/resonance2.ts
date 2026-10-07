// Cartethyia — Fleurdelys form: Resonance Skill 2 "May Tempest Break the Tides", combo follow-up of Skill 1.
import type { Action } from '../../../../../types/action'
import { aeroErosionExplosion } from '../../../../sideEffects/sideEffects'
import { fleurdelys_skill_1, fleurdelys_skill_1_cancel_with_swap } from './resonance1'

// ========== Resonance Skill 2 ================================================================================================
export const fleurdelys_skill_2: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill 2',
  displayName: 'May Tempest Break the Tides',
  category: 'Skills',
  castTime: 1.53, // TODO
  multiplier: (2 * 1.86 + 3 * 7.03) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.66 + 3 * 2.5, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'conviction', amount: 26.67, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND',
    comboWindow: {
      previousActions: [fleurdelys_skill_1, fleurdelys_skill_1_cancel_with_swap],
      maxTimeSincePrevious: 10,
      timerStartsAt: 'cast',
      crashesOnSwap: true,
      crashesOnFormChange: true,
    },
  },
  offtune: 2 * 0.06 + 3 * 0.21,
  groupName: 'Resonance Skill 2',
  variantName: 'Default',
}

export const fleurdelys_skill_2_cancel_with_swap: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill 2 (swap cancel)',
  displayName: 'May Tempest Break the Tides (swap cancel)',
  category: 'Skills',
  castTime: 1.53, // TODO
  multiplier: (2 * 1.86 + 3 * 7.03) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.66 + 3 * 2.5, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'conviction', amount: 26.67, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'ANY',
    swapOutState: 'AIR', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 100, // TODO : Persistence Time
    comboWindow: {
      previousActions: [fleurdelys_skill_1, fleurdelys_skill_1_cancel_with_swap],
      maxTimeSincePrevious: 10,
      timerStartsAt: 'cast',
      crashesOnSwap: true,
      crashesOnFormChange: true,
    },
  },
  offtune: 2 * 0.06 + 3 * 0.21,
  groupName: 'Resonance Skill 2',
  variantName: 'Cancel With Swap',
}
