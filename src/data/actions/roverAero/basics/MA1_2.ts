// Rover (Aero) — Mid-air "Cloudburst Dance" 1-2 after Skill 1, grants forte and the S4 skill buff.
import type { Action } from '../../../../types/action'
import { always } from '../../../helpers/modifierConditions'
import { roverAero_skill_1 } from '../skills/resonance1'

// ========== Mid Air 1-2 ======================================================================================================
export const roverAero_midair_1_2: Action = {
  tags: ['HEAL_PROC'],
  name: 'Mid Air 1-2',
  displayName: 'Cloudburst Dance 1-2',
  category: 'Skills',
  castTime: 0.8,
  multiplier: (128.8 + 141.47) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.92 + 1.01, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2.93 + 3.22, share: 0 },
    { energyType: 'forte', amount: 50, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Rover S4',
      displayName: 'Rover S4',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { skillBonusDMG: 0.15 },
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 6 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    previousActions: [roverAero_skill_1],
    endState: 'AIR',
  },
  offtune: 0.29 + 0.32,
  groupName: 'Mid Air 1-2',
  variantName: 'Default'
}

export const roverAero_midair_1_2_cancel_with_swap: Action = {
  tags: ['HEAL_PROC'],
  name: 'Mid Air 1-2 (swap cancel)',
  displayName: 'Cloudburst Dance 1-2 (swap cancel)',
  category: 'Skills',
  castTime: 0.55,
  multiplier: (128.8 + 141.47) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.92 + 1.01, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2.93 + 3.22, share: 0 },
    { energyType: 'forte', amount: 50, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Rover S4',
      displayName: 'Rover S4',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { skillBonusDMG: 0.15 },
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 6 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    previousActions: [roverAero_skill_1],
    swapOutState: 'AIR',
    endState: 'AIR',
    requiresSwapOut: true,
    persistenceTime: 1 // TODO
  },
  offtune: 0.29 + 0.32,
  groupName: 'Mid Air 1-2',
  variantName: 'Cancel With Swap'
}
