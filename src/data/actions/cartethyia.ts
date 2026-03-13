import type { Action } from '../../types/action'
import { always, stacksOfCap } from '../../utils/conditions/damageModifierConditions'
import { aeroErosionExplosion } from '../sideEffects'

// ========== Basic Attack 1-4 =================================================================================================
const cartethyia_BA_1_4_cancel_with_skill: Action = {
  name: 'Basic Attack 1-4 (skill cancel)',
  displayName: 'Basic Attack 1-4 (skill cancel)',
  category: 'Basics',
  castTime: 2.32,
  multiplier: (1.5 * (4.78 + (2 * 3.94 + 5.25) + 4 * 4.28 + (3 * 2.52 + 7.54))) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.7 + (2 * 0.58 + 0.77) + 4 * 0.63 + (3 * 0.37 + 1.11), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 0.98 + (2 * 0.81 + 1.08) + 4 * 0.88 + (3 * 0.52 + 1.55), share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 0.22 + (2 * 0.18 + 0.25) + 4 * 0.2 + (3 * 0.12 + 0.35),
  groupName: 'Basic Attack 1-4',
  variantName: 'Cancel With Skill'
}

const cartethyia_BA_1_4_cancel_with_swap: Action = {
  name: 'Basic Attack 1-4 (swap cancel)',
  displayName: 'Basic Attack 1-4 (swap cancel)',
  category: 'Basics',
  castTime: 2.26,
  multiplier: (1.5 * (4.78 + (2 * 3.94 + 5.25) + 4 * 4.28 + (3 * 2.52 + 7.54))) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.7 + (2 * 0.58 + 0.77) + 4 * 0.63 + (3 * 0.37 + 1.11), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 0.98 + (2 * 0.81 + 1.08) + 4 * 0.88 + (3 * 0.52 + 1.55), share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 0.22 + (2 * 0.18 + 0.25) + 4 * 0.2 + (3 * 0.12 + 0.35),
  groupName: 'Basic Attack 1-4',
  variantName: 'Cancel With Swap'
}

// ========== Basic Attack 2-4 =================================================================================================
const cartethyia_BA_2_4: Action = {
  name: 'Basic Attack 2-4',
  displayName: 'Basic Attack 2-4',
  category: 'Basics',
  castTime: 1.85,
  multiplier: (1.5 * (2 * 3.94 + 5.25 + 4 * 4.28 + (3 * 2.52 + 7.54))) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.58 + 0.77 + 4 * 0.63 + (3 * 0.37 + 1.11), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 0.81 + 1.08 + 4 * 0.88 + (3 * 0.52 + 1.55), share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiresSwapIn: true,
  },
  offtune: 2 * 0.18 + 0.25 + 4 * 0.2 + (3 * 0.12 + 0.35),
  toolTip: 'Can be cast after intro',
  groupName: 'Basic Attack 2-4',
  variantName: 'Default'
}

const cartethyia_BA_2_4_cancel_with_jump: Action = {
  name: 'Basic Attack 2-4 (jump cancel)',
  displayName: 'Basic Attack 2-4 (jump cancel)',
  category: 'Basics',
  castTime: 2.15,
  multiplier: (1.5 * (2 * 3.94 + 5.25 + 4 * 4.28 + (3 * 2.52 + 7.54))) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.58 + 0.77 + 4 * 0.63 + (3 * 0.37 + 1.11), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 0.81 + 1.08 + 4 * 0.88 + (3 * 0.52 + 1.55), share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'AIR',
    requiresSwapIn: true,
  },
  offtune: 2 * 0.18 + 0.25 + 4 * 0.2 + (3 * 0.12 + 0.35),
  toolTip: 'Can be cast after intro',
  groupName: 'Basic Attack 2-4',
  variantName: 'Cancel With Jump'
}

const cartethyia_BA_2_4_cancel_with_swap: Action = {
  name: 'Basic Attack 2-4 (swap cancel)',
  displayName: 'Basic Attack 2-4 (swap cancel)',
  category: 'Basics',
  castTime: 1.92,
  multiplier: (1.5 * (2 * 3.94 + 5.25 + 4 * 4.28 + (3 * 2.52 + 7.54))) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.58 + 0.77 + 4 * 0.63 + (3 * 0.37 + 1.11), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 0.81 + 1.08 + 4 * 0.88 + (3 * 0.52 + 1.55), share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapIn: true,
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 2 * 0.18 + 0.25 + 4 * 0.2 + (3 * 0.12 + 0.35),
  toolTip: 'Can be cast after intro',
  groupName: 'Basic Attack 2-4',
  variantName: 'Cancel With Swap'
}

// ========== Heavy Attack =====================================================================================================
const cartethyia_heavy: Action = {
  name: 'Heavy Attack',
  displayName: 'Heavy Attack',
  category: 'Basics',
  castTime: 1,
  multiplier: (1.5 * (3 * 2.08 + 6.24)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.42 + 1.25, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.59 + 1.75, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 3 * 0.13 + 0.4,
  groupName: 'Heavy Attack',
  variantName: 'Default'
}

const cartethyia_heavy_cancel_with_swap: Action = {
  name: 'Heavy Attack (swap cancel)',
  displayName: 'Heavy Attack (swap cancel)',
  category: 'Basics',
  castTime: 0.12,
  multiplier: (1.5 * (3 * 2.08 + 6.24)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.42 + 1.25, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.59 + 1.75, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    swapOutState: 'PRESERVE', // TODO : Double Check
    endState: 'PRESERVE',
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 3 * 0.13 + 0.4,
  groupName: 'Heavy Attack',
  variantName: 'Cancel With Swap'
}

// ========== Plunge Attack ====================================================================================================
const cartethyia_plunge: Action = { // TODO: If the sub actions aren't necessary in full, could simply define the rows we need to update (multipliers & offtune & substring to append to name...?)
  name: 'Plunge Attack',
  displayName: 'Plunge Attack',
  category: 'Basics',
  castTime: 1.00, // TODO : Cast Time
  multiplier: 0,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND'
  },
  offtune: 0,
  groupName: 'Plunge Attack',
  variantName: 'Default',
  resolveVariant(prevSnapshot, characterName) {
    const forte: number = prevSnapshot?.charactersEnergies[characterName]?.forte ?? 0
    const base =
      forte >= 3 ? cartethyiaPlunge_3 :
      forte >= 2 ? cartethyia_plunge_2 :
      forte >= 1 ? cartethyia_plunge_1 :
      { ...cartethyia_plunge_1, energyCost: [] }
    return {
      ...base,
      name: this.name,
      groupName: this.groupName,
      variantName: this.variantName,
      castTime: this.castTime,
      castConditions: this.castConditions,
      cooldown: this.cooldown,
      offtune: this.offtune,
    }
  }
}

const cartethyia_plunge_cancel_with_swap: Action = {
  name: 'Plunge Attack (swap cancel)',
  displayName: 'Plunge Attack (swap cancel)',
  category: 'Basics',
  castTime: 0.33, // TODO : Cast Time
  multiplier: 0,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    swapOutState: 'AIR', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 0,
  groupName: 'Plunge Attack',
  variantName: 'Cancel With Swap',
  resolveVariant(prevSnapshot, characterName) {
    const forte: number = prevSnapshot?.charactersEnergies[characterName]?.forte ?? 0
    const base =
      forte >= 3 ? cartethyiaPlunge_3 :
      forte >= 2 ? cartethyia_plunge_2 :
      forte >= 1 ? cartethyia_plunge_1 :
      { ...cartethyia_plunge_1, energyCost: [] }
    return {
      ...base,
      name: this.name,
      displayName: `${base.displayName} (swap cancel)`,
      groupName: this.groupName,
      variantName: this.variantName,
      castTime: this.castTime,
      castConditions: this.castConditions,
      cooldown: this.cooldown,
      offtune: this.offtune,
    }
  }
}

// Internal Action used as a variant for the main plunge actions
const cartethyia_plunge_1: Action = {
  name: 'Plunge Attack (0-1 swords)',
  displayName: 'Plunge Attack 1',
  category: 'Basics',
  castTime: 0,
  multiplier: (3 * 5.65) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1.33, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 1.86, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 1 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
  },
  offtune: 0.42,
  toolTip: 'Can be cast with 0-1 swords',
}

// Internal Action used as a variant for the main plunge actions
const cartethyia_plunge_2: Action = {
  name: 'Plunge Attack (2 swords)',
  displayName: 'Plunge Attack 2',
  category: 'Basics',
  castTime: 0,
  multiplier: (3 * (3 * 3.3)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.45, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.62, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 2 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
  },
  offtune: 3 * 0.14,
  toolTip: 'Can be cast with 2 swords',
}

// Internal Action used as a variant for the main plunge actions
const cartethyiaPlunge_3: Action = {
  name: 'Plunge Attack (3 swords)',
  displayName: 'Plunge Attack 3',
  category: 'Basics',
  castTime: 0,
  multiplier: (3 * (3 * 11.29)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.45, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.62, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 3 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
  },
  offtune: 3 * 0.14,
  toolTip: 'Can be cast with 3 swords',
}

// ========== Resonance Skill ==================================================================================================
const cartethyia_skill: Action = {
  name: 'Resonance Skill',
  displayName: 'Sword to Bear Their Names',
  category: 'Skills',
  castTime: 1, // TODO : Cast Time
  multiplier: (3 * 6.89 + 8.86) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 3.8 + 4.88, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'AIR',
  },
  offtune: 3 * 0.17 + 0.22,
  groupName: 'Resonance Skill',
  variantName: 'Default'
}

const cartethyia_skill_cancel_with_swap: Action = {
  name: 'Resonance Skill (swap cancel)',
  displayName: 'Sword to Bear Their Names (swap cancel)',
  category: 'Skills',
  castTime: 1, // TODO : Cast Time
  multiplier: (3 * 6.89 + 8.86) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 3.8 + 4.88, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    swapOutState: 'PRESERVE', // TODO : Double Check
    endState: 'AIR',
    requiresSwapOut: true,
    persistenceTime: 1.05
  },
  offtune: 3 * 0.17 + 0.22,
  groupName: 'Resonance Skill',
  variantName: 'Cancel With Swap'
}

// ========== Transform ========================================================================================================
const cartethyia_transform: Action = {
  name: 'To Fleurdelys Form',
  displayName: 'A Knights Heartfelt Prayers',
  category: 'Skills',
  castTime: 0.16,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 25,
  energyGenerated: [
    { energyType: 'energy', amount: 0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 20, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 125 }],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Cartethyia',
      displayName: 'Mandate',
      type: 'buff',
      ownerCharacter: 'Cartethyia',
      color: '#1e90ff',
      characterStats: { aeroErosionAmplifyDMG: 0.5 },
      negativeStatusEffects: [
        { targetStatus: 'Aero Erosion', property: 'frequency', value: -0.5 },
        { targetStatus: 'Aero Erosion', property: 'maxStacks', value: 3 },
      ],
      condition: always(),
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 12 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  formChange: 'Fleurdelys',
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0.0
}

// ========== Intro & Outro ====================================================================================================
const cartethyia_intro: Action = {
  name: 'Cartethyia Intro',
  displayName: 'Sword to Mark Tides Trace',
  category: 'Other',
  castTime: 0.92, // TODO
  multiplier: (1.5 * (3 * 2.08 + 6.24)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 1.67 + 5.0, share: 0.5, scalingStat: 'energyPercent' },
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
  offtune: 3 * 0.12 + 0.35
}

const cartethyia_outro: Action = {
  name: 'Outro',
  displayName: 'Winds Divine Blessing',
  category: 'Other',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['OUTRO'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

// ========== Basic 1-5 ========================================================================================================
const fleurdelys_BA_1_5: Action = {
  name: 'Basic 1-5',
  displayName: 'Basic 1-5',
  category: 'Basics',
  castTime: 3.4, // TODO
  multiplier: (6.49 + (3.63 + 3 * 1.82) + (3 * 2.13 + 4.26) + 5 * 2.74 + (7.2 + 28.8)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.75 + (0.77 + 3 * 0.39) + (3 * 0.45 + 0.9) + 5 * 0.45 + (0.4 + 1.59), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 1.05 + (1.07 + 3 * 0.54) + (3 * 0.63 + 1.26) + 5 * 0.63 + (0.56 + 2.22), share: 0 },
    { energyType: 'conviction', amount: 45, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 0.24 + (0.24 + 3 * 0.12) + (3 * 0.14 + 1.26) + 5 * 0.14 + (0.13 + 0.51),
  groupName: 'Basic 1-5',
  variantName: 'Default'
}

const fleurdelys_BA_1_5_cancel_with_swap: Action = {
  name: 'Basic 1-5 (swap cancel)',
  displayName: 'Basic 1-5 (swap cancel)',
  category: 'Basics',
  castTime: 3.4, // TODO
  multiplier: (6.49 + (3.63 + 3 * 1.82) + (3 * 2.13 + 4.26) + 5 * 2.74 + (7.2 + 28.8)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.75 + (0.77 + 3 * 0.39) + (3 * 0.45 + 0.9) + 5 * 0.45 + (0.4 + 1.59), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 1.05 + (1.07 + 3 * 0.54) + (3 * 0.63 + 1.26) + 5 * 0.63 + (0.56 + 2.22), share: 0 },
    { energyType: 'conviction', amount: 45, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 0.24 + (0.24 + 3 * 0.12) + (3 * 0.14 + 1.26) + 5 * 0.14 + (0.13 + 0.51),
  groupName: 'Basic 1-5',
  variantName: 'Cancel With Swap'
}

// ========== Basic 3-5 ========================================================================================================
const fleurdelys_BA_3_5: Action = {
  name: 'Basic 3-5',
  displayName: 'Basic 3-5',
  category: 'Basics',
  castTime: 2.67, // TODO
  multiplier: (3 * 2.13 + 4.26 + 5 * 2.74 + (7.2 + 28.8)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.45 + 0.9 + 5 * 0.45 + (0.4 + 1.59), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.63 + 1.26 + 5 * 0.63 + (0.56 + 2.22), share: 0 },
    { energyType: 'conviction', amount: 36.67, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiresSwapIn: true,
  },
  offtune: 3 * 0.14 + 1.26 + 5 * 0.14 + (0.13 + 0.51),
  toolTip: 'Can be cast when quick swapped in without intro',
  groupName: 'Basic 3-5',
  variantName: 'Default'
}

const fleurdelys_BA_3_5_cancel_with_swap: Action = {
  name: 'Basic 3-5 (swap cancel)',
  displayName: 'Basic 3-5 (swap cancel)',
  category: 'Basics',
  castTime: 2.67, // TODO
  multiplier: (3 * 2.13 + 4.26 + 5 * 2.74 + (7.2 + 28.8)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.45 + 0.9 + 5 * 0.45 + (0.4 + 1.59), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.63 + 1.26 + 5 * 0.63 + (0.56 + 2.22), share: 0 },
    { energyType: 'conviction', amount: 36.67, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapIn: true,
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 3 * 0.14 + 1.26 + 5 * 0.14 + (0.13 + 0.51),
  toolTip: 'Can be cast when quick swapped in without intro',
  groupName: 'Basic 3-5',
  variantName: 'Cancel With Swap'
}

// ========== Heavy Attack 1 ===================================================================================================
const fleurdelys_heavy_1: Action = {
  name: 'Heavy Attack 1',
  displayName: 'Heavy Attack 1',
  category: 'Basics',
  castTime: 0.65, // TODO
  multiplier: (4.28 + 9.97) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.53 + 1.23, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 0.74 + 1.72, share: 0 },
    { energyType: 'conviction', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 0.17 + 0.39,
  groupName: 'Heavy Attack 1',
  variantName: 'Default'
}

const fleurdelys_heavy_1_cancel_with_swap: Action = {
  name: 'Heavy Attack 1 (swap cancel)',
  displayName: 'Heavy Attack 1 (swap cancel)',
  category: 'Basics',
  castTime: 0.65, // TODO
  multiplier: (4.28 + 9.97) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.53 + 1.23, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 0.74 + 1.72, share: 0 },
    { energyType: 'conviction', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 0.17 + 0.39,
  groupName: 'Heavy Attack 1',
  variantName: 'Cancel With Swap'
}

// ========== Heavy Attack 2 ===================================================================================================
const fleurdelys_heavy_2: Action = {
  name: 'Enhanced Heavy Attack',
  displayName: 'Heavy Attack 2',
  category: 'Basics',
  castTime: 0.73, // TODO
  multiplier: (2 * 7.78 + 3.89) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.96 + 0.48, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 1.35 + 0.68, share: 0 },
    { energyType: 'conviction', amount: 13.33, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    previousActions: [fleurdelys_heavy_1, fleurdelys_heavy_1_cancel_with_swap],
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 3 * 0.31 + 0.15,
  groupName: 'Heavy Attack 2',
  variantName: 'Default'
}

const fleurdelys_heavy_2_cancel_with_swap: Action = {
  name: 'Enhanced Heavy Attack (swap cancel)',
  displayName: 'Heavy Attack 2 (swap cancel)',
  category: 'Basics',
  castTime: 0.73, // TODO
  multiplier: (2 * 7.78 + 3.89) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.96 + 0.48, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 1.35 + 0.68, share: 0 },
    { energyType: 'conviction', amount: 13.33, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    previousActions: [fleurdelys_heavy_1, fleurdelys_heavy_1_cancel_with_swap],
    startState: 'GROUND',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 3 * 0.31 + 0.15,
  groupName: 'Heavy Attack 2',
  variantName: 'Cancel With Swap'
}

// ========== Mid-air Attack 1-3 ===============================================================================================
const fleurdelys_midair_1_3: Action = {
  name: 'Mid-air Attack 1-3',
  displayName: 'Mid-air Attack 1-3',
  category: 'Basics',
  castTime: 2.47, // TODO
  multiplier: (2 * 2.99 + 3.08 + (2 * 7.39 + 14.77) + 2.2) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.66 + 0.68 + (2 * 0.52 + 1.03) + 0.48, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 0.93 + 0.95 + (2 * 0.52 + 1.44) + 0.67, share: 0 },
    { energyType: 'conviction', amount: 25, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
  },
  offtune: 2 * 0.21 + 0.22 + (2 * 0.16 + 0.33) + 0.15,
  groupName: 'Mid-air Attack 1-3',
  variantName: 'Default'
}

const fleurdelys_midair_1_3_cancel_with_swap: Action = {
  name: 'Mid-air Attack 1-3 (swap cancel)',
  displayName: 'Mid-air Attack 1-3 (swap cancel)',
  category: 'Basics',
  castTime: 2.47, // TODO
  multiplier: (2 * 2.99 + 3.08 + (2 * 7.39 + 14.77) + 2.2) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.66 + 0.68 + (2 * 0.52 + 1.03) + 0.48, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 0.93 + 0.95 + (2 * 0.52 + 1.44) + 0.67, share: 0 },
    { energyType: 'conviction', amount: 25, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'AIR',
    swapOutState: 'AIR', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 2 * 0.21 + 0.22 + (2 * 0.16 + 0.33) + 0.15,
  groupName: 'Mid-air Attack 1-3',
  variantName: 'Cancel With Swap'
}

// ========== Mid-air Attack 1-2 ===============================================================================================
const fleurdelys_midair_1_2: Action = {
  name: 'Mid-air Attack 1-2',
  displayName: 'Mid-air Attack 1-2',
  category: 'Basics',
  castTime: 1.63, // TODO
  multiplier: (2 * 2.99 + 3.08 + (2 * 7.39 + 14.77)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.66 + 0.68 + (2 * 0.52 + 1.03), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 0.93 + 0.95 + (2 * 0.52 + 1.44), share: 0 },
    { energyType: 'conviction', amount: 20, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
  },
  offtune: 2 * 0.21 + 0.22 + (2 * 0.16 + 0.33),
  groupName: 'Mid-air Attack 1-2',
  variantName: 'Default'
}

const fleurdelys_midair_1_2_cancel_with_swap: Action = {
  name: 'Mid-air Attack 1-2 (swap cancel)',
  displayName: 'Mid-air Attack 1-2 (swap cancel)',
  category: 'Basics',
  castTime: 1.63, // TODO
  multiplier: (2 * 2.99 + 3.08 + (2 * 7.39 + 14.77)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.66 + 0.68 + (2 * 0.52 + 1.03), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 0.93 + 0.95 + (2 * 0.52 + 1.44), share: 0 },
    { energyType: 'conviction', amount: 20, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'AIR',
    swapOutState: 'AIR', // TODO : Double Check
    endState: 'AIR',
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 2 * 0.21 + 0.22 + (2 * 0.16 + 0.33),
  groupName: 'Mid-air Attack 1-2',
  variantName: 'Cancel With Swap'
}

// ========== Resonance Skill 1 ================================================================================================
const fleurdelys_skill_1: Action = {
  name: 'Resonance Skill 1',
  displayName: 'Sword to Answer Waves Call',
  category: 'Skills',
  castTime: 0.9, // TODO
  multiplier: (4 * 1.86 + 17.36) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.18 + 1.61, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'conviction', amount: 13.34, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'AIR',
  },
  offtune: 4 * 0.06 + 0.51,
  groupName: 'Resonance Skill 1',
  variantName: 'Default'
}

const fleurdelys_skill_1_cancel_with_swap: Action = {
  name: 'Resonance Skill 1 (swap cancel)',
  displayName: 'Sword to Answer Waves Call (swap cancel)',
  category: 'Skills',
  castTime: 0.9, // TODO
  multiplier: (4 * 1.86 + 17.36) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.18 + 1.61, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'conviction', amount: 13.34, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'AIR',
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 4 * 0.06 + 0.51,
  groupName: 'Resonance Skill 1',
  variantName: 'Cancel With Swap'
}

// ========== Resonance Skill 2 ================================================================================================
const fleurdelys_skill_2: Action = {
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
  },
  offtune: 2 * 0.06 + 3 * 0.21,
  groupName: 'Resonance Skill 2',
  variantName: 'Default'
}

const fleurdelys_skill_2_cancel_with_swap: Action = {
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
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 2 * 0.06 + 3 * 0.21,
  groupName: 'Resonance Skill 2',
  variantName: 'Cancel With Swap'
}

// ========== Liberation =======================================================================================================
const fleurdelys_liberation: Action = {
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
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: -100 }, { type: 'buff', targetName: 'Mandate', stackChange: -1 }],
  damageModifiers: [
    {
      source: 'Liberation Stacks',
      displayName: 'Liberation Passive',
      type: 'buff',
      ownerCharacter: 'Cartethyia',
      condition: stacksOfCap('Aero Erosion'),
      characterStats: { liberationTotalMultiplierDMG: 0.2 },
      targetStrategy: 'self',
      durationStrategy: { type: 'permanent' },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  formChange: 'Cartethyia',
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND',
  },
  offtune: 7 * 2.4
}



const fleurdelys_intro: Action = { // TODO: Define Fleyrdelys' real intro
  name: 'Fleurdelys Intro',
  displayName: 'Sword to Mark Tides Trace',
  category: 'Other',
  castTime: 0.92,
  multiplier: (3 * (3 * 2.08 + 6.24)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 1.67 + 5.0, share: 0.5, scalingStat: 'energyPercent' },
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
  offtune: 3 * 0.12 + 0.35
}

// ========== Energies =========================================================================================================
const cartethyia_energy: Action = {
  name: 'Energy Up',
  displayName: 'Energy Up',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'energy', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

const cartethyia_concerto: Action = {
  name: 'Concerto Up',
  displayName: 'Concerto Up',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'concerto', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

const cartethyia_forte: Action = {
  name: 'Forte Up',
  displayName: 'Forte Up',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'forte', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

const cartethyia_conviction: Action = {
  name: 'Conviction Up',
  displayName: 'Conviction Up',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'conviction', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

export const cartethyia_actions = [
  cartethyia_BA_1_4_cancel_with_skill,
  cartethyia_BA_1_4_cancel_with_swap,
  cartethyia_BA_2_4,
  cartethyia_BA_2_4_cancel_with_jump,
  cartethyia_BA_2_4_cancel_with_swap,
  cartethyia_heavy,
  cartethyia_heavy_cancel_with_swap,
  cartethyia_plunge,
  cartethyia_plunge_cancel_with_swap,
  cartethyia_skill,
  cartethyia_skill_cancel_with_swap,
  cartethyia_transform,
]

export const fleurdelys_actions = [
  fleurdelys_BA_1_5,
  fleurdelys_BA_1_5_cancel_with_swap,
  fleurdelys_BA_3_5,
  fleurdelys_BA_3_5_cancel_with_swap,
  fleurdelys_heavy_1,
  fleurdelys_heavy_1_cancel_with_swap,
  fleurdelys_heavy_2,
  fleurdelys_heavy_2_cancel_with_swap,
  fleurdelys_midair_1_3,
  fleurdelys_midair_1_3_cancel_with_swap,
  fleurdelys_midair_1_2,
  fleurdelys_midair_1_2_cancel_with_swap,
  fleurdelys_skill_1,
  fleurdelys_skill_1_cancel_with_swap,
  fleurdelys_skill_2,
  fleurdelys_skill_2_cancel_with_swap,
  fleurdelys_liberation,
]

export const universal_actions = [
  cartethyia_energy,
  cartethyia_concerto,
  cartethyia_forte,
  cartethyia_conviction,
]

export const cartethyia_intro_outro_actions = [
  cartethyia_intro,
  cartethyia_outro,
]

export const fleurdelys_intro_outro_actions = [
  fleurdelys_intro
]

export const all_actions = [
  ...cartethyia_actions,
  ...fleurdelys_actions,
  ...universal_actions,
  ...cartethyia_intro_outro_actions,
  ...fleurdelys_intro_outro_actions
]
