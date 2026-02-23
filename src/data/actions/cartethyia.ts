import { buildBasicAction, repeatEnergy } from '../../utils/data-builders/basics'
import type { ActionExpanded, BasicsData } from '../../types/action'

// ========== Basic ===========================================================================================================

const basics: BasicsData = {
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,

  castConditions: {
    position: 'GROUND',
    previousAction: '',
    endState: 'GROUND',
  },

  stages: {
    1: {
      multipliers: [0.0478],
      energiesGenerated: [
        [
          { energyType: 'energy', amount: 0.7, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 0.98, share: 0 },
        ],
      ],
      statusModifications: [],
      damageModifiers: [],
      sideEffects: [],
      other: {
        hardness: [1],
        toughness: [0.28],
        offtune: [0.224],
      },
    },

    2: {
      multipliers: [0.0394, 0.0394, 0.0525],
      energiesGenerated: [
        [
          { energyType: 'energy', amount: 0.58, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 0.81, share: 0 },
        ],
        [
          { energyType: 'energy', amount: 0.58, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 0.81, share: 0 },
        ],
        [
          { energyType: 'energy', amount: 0.77, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 1.08, share: 0 },
        ],
      ],
      statusModifications: [],
      damageModifiers: [],
      sideEffects: [],
      other: {
        hardness: [1, 1, 1],
        toughness: [0.2304, 0.2304, 0.3072],
        offtune: [0.1844, 0.1844, 0.2458],
      },
    },

    3: {
      multipliers: [0.0428, 0.0428, 0.0428, 0.0428],
      energiesGenerated: repeatEnergy(4, [
        { energyType: 'energy', amount: 0.63, share: 0.5, scalingStat: 'energyPercent' },
        { energyType: 'concerto', amount: 0.88, share: 0 },
      ]),
      statusModifications: [],
      damageModifiers: [],
      sideEffects: [],
      other: {
        hardness: [1, 1, 1, 1],
        toughness: [0.2505, 0.2505, 0.2505, 0.2505],
        offtune: [0.2004, 0.2004, 0.2004, 0.2004],
      },
    },

    4: {
      multipliers: [0.0252, 0.0252, 0.0252, 0.0754],
      energiesGenerated: [
        [
          { energyType: 'energy', amount: 0.37, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 0.52, share: 0 },
        ],
        [
          { energyType: 'energy', amount: 0.37, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 0.52, share: 0 },
        ],
        [
          { energyType: 'energy', amount: 0.37, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 0.52, share: 0 },
        ],
        [
          { energyType: 'energy', amount: 1.11, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 1.55, share: 0 },
        ],
      ],
      statusModifications: [],
      damageModifiers: [],
      sideEffects: [],
      other: {
        hardness: [1, 1, 1, 1],
        toughness: [0.1474, 0.1474, 0.1474, 0.442],
        offtune: [0.1179, 0.1179, 0.1179, 0.3536],
      },
    },
  },
}

export const cartethyiaBasic_1_4: ActionExpanded = buildBasicAction({
  name: 'Basic Attack 1-4',
  displayName: 'Basic Attack 1-4',
  basics,
  fromStage: 1,
  toStage: 4,
})

export const cartethyiaBasic_2_4: ActionExpanded = buildBasicAction({
  name: 'Basic Attack 2-4',
  displayName: 'Basic Attack 2-4',
  basics,
  fromStage: 2,
  toStage: 4,
})

export const cartethyiaHeavyAttack: ActionExpanded = {
  name: 'Heavy Attack',
  displayName: 'Heavy Attack',
  castTime: 1,
  multipliers: [0.0208, 0.0208, 0.0208, 0.0624], // x1.5 from Sequence
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,

  castConditions: {
    position: 'GROUND',
    previousAction: '',
    endState: 'GROUND',
  },

  energiesGenerated: [
    [
      { energyType: 'energy', amount: 0.42, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 0.59, share: 0 },
      { energyType: 'forte', amount: 1, share: 0 },
    ],
    [
      { energyType: 'energy', amount: 0.42, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 0.59, share: 0 },
    ],
    [
      { energyType: 'energy', amount: 0.42, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 0.59, share: 0 },
    ],
    [
      { energyType: 'energy', amount: 1.25, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 1.75, share: 0 },
    ],
  ],
  energiesCost: [],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [1, 1, 1, 1],
    toughness: [0.1667, 0.1667, 0.1667, 0.5],
    offtune: [0.1334, 0.1334, 0.1334, 0.4],
  },
}

export const cartethyiaMidairAttack: ActionExpanded = {
  name: 'Mid-Air Attack',
  displayName: 'Plunge Attack',
  castTime: 0,
  multipliers: [0.0565],
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,

  castConditions: {
    position: 'AIR',
    previousAction: '',
    endState: 'GROUND',
  },

  energiesGenerated: [
    [
      { energyType: 'energy', amount: 0.45, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 0.62, share: 0 },
    ],
  ],
  energiesCost: [],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [1],
    toughness: [0.531],
    offtune: [0.1416],
  },
}

// ========== Forte ===========================================================================================================

export const CartethyiaFortePlunge_1: ActionExpanded = {
  name: 'Mid-Air Attack 1 Sword',
  displayName: 'Forte Plunge Attack (1)',
  castTime: 0,
  multipliers: [0.056],
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,

  castConditions: {
    position: 'AIR',
    previousAction: '',
    endState: 'GROUND',
  },

  energiesGenerated: [
    [
      { energyType: 'energy', amount: 1.33, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 1.86, share: 0 },
    ],
  ],
  energiesCost: [{ energyType: 'forte', amount: 1 }],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [1],
    toughness: [0.531],
    offtune: [0.4248],
  },
}

export const CartethyiaFortePlunge_2: ActionExpanded = {
  name: 'Mid-Air Attack 2 Swords',
  displayName: 'Forte Plunge Attack (2)',
  castTime: 0,
  multipliers: [0.033, 0.033, 0.033],
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,

  castConditions: {
    position: 'AIR',
    previousAction: '',
    endState: 'GROUND',
  },

  energiesGenerated: [
    [
      { energyType: 'energy', amount: 0.45, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 0.62, share: 0 },
    ],
    [
      { energyType: 'energy', amount: 0.45, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 0.62, share: 0 },
    ],
    [
      { energyType: 'energy', amount: 0.45, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 0.62, share: 0 },
    ],
  ],
  energiesCost: [{ energyType: 'forte', amount: 2 }],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [1, 1, 1],
    toughness: [0.531, 0.531, 0.531],
    offtune: [0.1416, 0.1416, 0.1416],
  },
}

export const CartethyiaFortePlunge_3: ActionExpanded = {
  name: 'Mid-Air Attack 3 Swords',
  displayName: 'Forte Plunge Attack (3)',
  castTime: 0,
  multipliers: [0.1129, 0.1129, 0.1129],
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,

  castConditions: {
    position: 'AIR',
    previousAction: '',
    endState: 'GROUND',
  },

  energiesGenerated: [
    [
      { energyType: 'energy', amount: 0.45, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 0.62, share: 0 },
    ],
    [
      { energyType: 'energy', amount: 0.45, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 0.62, share: 0 },
    ],
    [
      { energyType: 'energy', amount: 0.45, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 0.62, share: 0 },
    ],
  ],
  energiesCost: [{ energyType: 'forte', amount: 3 }],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [1, 1, 1],
    toughness: [0.531, 0.531, 0.531],
    offtune: [0.1416, 0.1416, 0.1416],
  },
}

// ========== Skill ===========================================================================================================

// ========== Liberation ======================================================================================================

// ========== Intro & Outro ===================================================================================================
