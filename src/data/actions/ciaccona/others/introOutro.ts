// Ciaccona — Intro "Roaming with the Wind" and Outro "Windcalling Tune" (Aero Erosion DMG amplify).
import type { Action } from '../../../../types/action'
import { always } from '../../../helpers/modifierConditions'

// ========== Intro & Outro ====================================================================================================
export const ciaccona_intro: Action = {
  tags: ['INTRO_ACTION'],
  name: 'Intro Skill',
  displayName: 'Roaming with the Wind',
  category: 'Other',
  castTime: 0.95,
  multiplier: 189.11 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10.0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND',
  },
  offtune: 0.93
}

export const ciaccona_outro: Action = {
  tags: ['OUTRO_ACTION'],
  name: 'Outro Skill',
  displayName: 'Windcalling Tune',
  category: 'Other',
  castTime: 0,
  multiplier: 0 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['OUTRO'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Ciaconna Outro Buff',
      displayName: 'Windcalling Tune',
      type: 'buff',
      ownerCharacter: 'Ciaccona',
      condition: always(),
      characterStats: { aeroErosionAmplifyDMG: 1.0 },
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}
