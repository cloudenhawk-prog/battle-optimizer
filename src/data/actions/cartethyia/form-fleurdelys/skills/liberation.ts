// Cartethyia — Fleurdelys form: Liberation "Blade of Howling Squall" (returns to Cartethyia form).
import type { Action } from '../../../../../types/action'

// ========== Liberation =======================================================================================================
export const fleurdelys_liberation: Action = {
  tags: ['LIBERATION'],
  name: 'Liberation (Fleurdelys)',
  displayName: 'Blade of Howling Squall',
  category: 'Skills',
  castTime: 0.03,
  multiplier: (2 * (7 * 13.12)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 25,
  energyGenerated: [
    { energyType: 'energy', amount: 0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 20, share: 0 },
  ],
  energyCost: [{ energyType: 'conviction', amount: 120 }],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: -100 },
    { type: 'buff', targetName: 'Mandate', stackChange: -1 },
    { type: 'buff', targetName: 'Power of Discord', stackChange: -1 },
    { type: 'buff', targetName: "Fleurdelys's Conviction", stackChange: -100 },
  ],
  damageModifiers: [],
  inherentModifiers: [
    {
      // +100% Liberation Total Multiplier DMG base, +20% per Aero Erosion stack (max 5 stacks)
      displayName: 'Liberation Aero Erosion Stacks',
      characterStats: { liberationTotalMultiplierDMG: 1 },
      condition: (ctx) => {
        const status = ctx.negativeStatusesInAction.find(ns => ns.negativeStatus.name === 'Aero Erosion')
        const stacks = status?.currentStacks ?? 0
        return 1 + 0.2 * Math.min(stacks, 5)
      },
    },
  ],
  sideEffects: [],
  formChange: 'Cartethyia',
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND',
  },
  offtune: 7 * 2.4,
}
