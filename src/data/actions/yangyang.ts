import type { DamageType, ElementType, Position, ScalingType } from "../../types/baseTypes"
import type { EnergyCost, EnergyGeneration } from "../../types/energy"
import type { DamageModifier } from "../../types/modifiers"
import type { SideEffect, StatusModification } from "../../types/sideEffect"

type CastConditions = { // TODO: redo resolvers flow and use new types - put into own types files
  position: Position
  previousAction: string
  endState: Position
}

type Other = { // TODO: doesnt require any logic yet, just keep it as a type in its own file for now
  hardness: number[]
  toughness: number[]
  offtune: number[]
}

export type Action = { // TODO: replace Action type from global types, and update resolvers
  name: string
  displayName: string
  castTime: number
  multipliers: number[]
  scaling: ScalingType
  elements: ElementType[]
  dmgTypes: DamageType[]
  cooldown: number

  castConditions: CastConditions

  energiesGenerated: EnergyGeneration[][]
  energiesCost: EnergyCost[]

  statusModifications: StatusModification[]
  damageModifiers: DamageModifier[]
  sideEffects: SideEffect[]

  other: Other
}

// ========== Basic ===========================================================================================================

const basics = {
  scaling: 'ATK',
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
      multipliers: [0.4473],
      energiesGenerated: [
        [
          { energyType: 'energy', amount: 0.75, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 2.4, share: 0 }
        ]
      ],
      statusModifications: [],
      damageModifiers: [],
      sideEffects: [],
      other: {
        hardness: [1],
        toughness: [0.3],
        offtune: [0.24]
      }
    },
    2: {
      multipliers: [0.5964],
      energiesGenerated: [
        [
          { energyType: 'energy', amount: 1.00, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 3.2, share: 0 }
        ]
      ],
      statusModifications: [],
      damageModifiers: [],
      sideEffects: [],
      other: {
        hardness: [1],
        toughness: [0.4],
        offtune: [0.32]
      }
    },
    3: {
      multipliers: [0.4681, 0.4681],
      energiesGenerated: [
        [
          { energyType: 'energy', amount: 2 * 0.78, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 2 * 2.51, share: 0 }
        ],
        [
          { energyType: 'energy', amount: 2 * 0.78, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 2 * 2.51, share: 0 }
        ]
      ],
      statusModifications: [],
      damageModifiers: [],
      sideEffects: [],
      other: {
        hardness: [1, 1],
        toughness: [0.314, 0.314],
        offtune: [0.252, 0.252]
      }
    },
    4: {
      multipliers: [0.5936, 0.5936, 0.7914],
      energiesGenerated: [
        [
          { energyType: 'energy', amount: 1, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 3.18, share: 0 },
          { energyType: 'forte', amount: 1, share: 0 }
        ],
        [
          { energyType: 'energy', amount: 1, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 3.18, share: 0 }
        ],
        [
          { energyType: 'energy', amount: 1.32, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 4.24, share: 0 }
        ],
      ],
      statusModifications: [],
      damageModifiers: [],
      sideEffects: [],
      other: {
        hardness: [1, 1, 1],
        toughness: [0.3981, 0.3981, 0.5308],
        offtune: [0.3192, 0.3192, 0.4256]
      }
    }
  }
}

export const basic_1_4: Action = {
  name: 'Basic Attack 1-4',
  displayName: 'Basic Attack 1-4',
  castTime: 0,
  multipliers: Object.values(basics.stages).slice(0, 4).flatMap(stage => stage.multipliers),
  scaling: basics.scaling as ScalingType,
  elements: basics.elements as ElementType[],
  dmgTypes: basics.dmgTypes as DamageType[],
  cooldown: basics.cooldown,

  castConditions: basics.castConditions as CastConditions,

  energiesGenerated: Object.values(basics.stages).slice(0, 4).flatMap(stage => stage.energiesGenerated) as EnergyGeneration[][],
  energiesCost: [],

  statusModifications: Object.values(basics.stages).slice(0, 4).flatMap(stage => stage.statusModifications),
  damageModifiers: Object.values(basics.stages).slice(0, 4).flatMap(stage => stage.damageModifiers),
  sideEffects: Object.values(basics.stages).slice(0, 4).flatMap(stage => stage.sideEffects),

  other: {
    hardness: Object.values(basics.stages).slice(0, 4).flatMap(stage => stage.other.hardness),
    toughness: Object.values(basics.stages).slice(0, 4).flatMap(stage => stage.other.toughness),
    offtune: Object.values(basics.stages).slice(0, 4).flatMap(stage => stage.other.offtune)
  }
}

export const heavy_1: Action = {
  name: 'Heavy Attack',
  displayName: 'Heavy Attack',
  castTime: 0,
  multipliers: [0.1988, 0.1988, 0.1988],
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,

  castConditions: {
    position: 'GROUND',
    previousAction: '',
    endState: 'GROUND',
  },

  energiesGenerated: [
    [
      { energyType: 'energy', amount: 0.33, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 1.06, share: 0 }
    ],
    [
      { energyType: 'energy', amount: 0.33, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 1.06, share: 0 }
    ],
    [
      { energyType: 'energy', amount: 0.33, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 1.06, share: 0 }
    ]
  ],
  energiesCost: [],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [1, 1, 1],
    toughness: [0.1333, 0.1333, 0.1333],
    offtune: [0.1067, 0.1067, 0.1067]
  }
}

export const heavy_2: Action = {
  name: 'Zephyr Song',
  displayName: 'Heavy Attack 2',
  castTime: 0,
  multipliers: [1.0661],
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,

  castConditions: {
    position: 'GROUND',
    previousAction: 'Heavy Attack',
    endState: 'GROUND',
  },

  energiesGenerated: [
    [
      { energyType: 'energy', amount: 1.78, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 5.72, share: 0 },
      { energyType: 'forte', amount: 1, share: 0 }
    ]
  ],
  energiesCost: [],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [1],
    toughness: [0.715],
    offtune: [0.576]
  }
}

export const mid_air_1: Action = {
  name: 'Mid-Air Attack',
  displayName: 'Plunge Attack',
  castTime: 0,
  multipliers: [0.9244],
  scaling: 'ATK',
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
      { energyType: 'energy', amount: 0.51, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 1, share: 0 }
    ]
  ],
  energiesCost: [],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [1],
    toughness: [0.62],
    offtune: [0.496]
  }
}

export const dodge_counter: Action = {
  name: 'Dodge Counter',
  displayName: 'Dodge Counter',
  castTime: 0,
  multipliers: [0.8707, 0.8707], //TODO : resolver should ensure that the length of 'multipliers', 'energiesGenerated', 'hardness', 'toughness', 'offtune' is the same; alternatively when the app is started, a verifyData-script should run
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,

  castConditions: {
    position: 'GROUND',
    previousAction: '',
    endState: 'GROUND',
  },

  energiesGenerated: [
    [
      { energyType: 'energy', amount: 1.36, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 1.98, share: 0 }
    ],
    [
      { energyType: 'energy', amount: 1.36, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 1.98, share: 0 }
    ]
  ],
  energiesCost: [],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [1, 1],
    toughness: [0.75, 0.75],
    offtune: [0.2, 0.2]
  }
}

// ========== Forte ===========================================================================================================

export const mid_air_2: Action = {
  name: 'Feather Release',
  displayName: 'Forte Plunge Attack',
  castTime: 0,
  multipliers: [0.2173, 0.2173, 0.2173, 0.2173, 0.2173, 1.2681, 1.2681],
  scaling: 'ATK',
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
      { energyType: 'energy', amount: 0.36, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 30, share: 0 }
    ],
    [
      { energyType: 'energy', amount: 0.36, share: 0.5, scalingStat: 'energyPercent' }
    ],
    [
      { energyType: 'energy', amount: 0.36, share: 0.5, scalingStat: 'energyPercent' }
    ],
    [
      { energyType: 'energy', amount: 0.36, share: 0.5, scalingStat: 'energyPercent' }
    ],
    [
      { energyType: 'energy', amount: 0.36, share: 0.5, scalingStat: 'energyPercent' }
    ],
    [
      { energyType: 'energy', amount: 2.12, share: 0.5, scalingStat: 'energyPercent' }
    ],
    [
      { energyType: 'energy', amount: 2.12, share: 0.5, scalingStat: 'energyPercent' }
    ]
  ],
  energiesCost: [],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [1, 1, 1, 1, 1, 1, 1],
    toughness: [0.1458, 0.1458, 0.1458, 0.1458, 0.1458, 0.8505, 0.8505],
    offtune: [0.1167, 0.1167, 0.1167, 0.1167, 0.1167, 0.6804, 0.6804]
  }
}

// ========== Skill ===========================================================================================================

export const skill: Action = {
  name: 'Zephyr Domain',
  displayName: 'Resonance Skill',
  castTime: 0,
  multipliers: [34.53, 34.53, 34.53, 34.53, 207.19],
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 10,

  castConditions: {
    position: 'GROUND',
    previousAction: '',
    endState: 'GROUND',
  },

  energiesGenerated: [
    [
      { energyType: 'energy', amount: 1.18, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 15, share: 0 },
      { energyType: 'forte', amount: 1, share: 0 }
    ],
    [
      { energyType: 'energy', amount: 1.18, share: 0.5, scalingStat: 'energyPercent' },
    ],
    [
      { energyType: 'energy', amount: 1.18, share: 0.5, scalingStat: 'energyPercent' },
    ],
    [
      { energyType: 'energy', amount: 1.18, share: 0.5, scalingStat: 'energyPercent' },
    ],
    [
      { energyType: 'energy', amount: 7.1, share: 0.5, scalingStat: 'energyPercent' },
    ]
  ],
  energiesCost: [],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [1, 1, 1, 1, 1],
    toughness: [0.2, 0.2, 0.2, 0.2, 1.2],
    offtune: [0.059, 0.059, 0.059, 0.059, 0.3538]
  }
}

// ========== Liberation ======================================================================================================

export const liberation: Action = {
  name: 'Wind Spirals',
  displayName: 'Liberation',
  castTime: 0,
  multipliers: [0.4658, 0.4658, 0.4658, 0.4658, 0.4658, 0.4658, 0.4658, 0.4658, 0.4658, 0.4658, 0.4658, 0.4658, 3.727],
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,

  castConditions: {
    position: 'GROUND',
    previousAction: '',
    endState: 'GROUND',
  },

  energiesGenerated: [
    [
      { energyType: 'concerto', amount: 20, share: 0 }
    ],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
  ],
  energiesCost: [{ energyType: 'energy', amount: 100 }],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    toughness: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 1.6],
    offtune: [0.3072, 0.3072, 0.3072, 0.3072, 0.3072, 0.3072, 0.3072, 0.3072, 0.3072, 0.3072, 0.3072, 0.3072, 2.4576]
  }
}

// ========== Intro & Outro ===================================================================================================

export const intro: Action = {
  name: 'Cerulean Song',
  displayName: 'Intro',
  castTime: 0,
  multipliers: [0.7952, 0.7952],
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,

  castConditions: {
    position: '', // TODO, create ENUM base type: '' | 'GROUND' | 'AIR'
    previousAction: 'Outro', // TODO: should match display name which should be stored in the snapshot under (action) - I think we do this already
    endState: 'AIR', // TODO, create ENUM base type: '' | 'GROUND' | 'AIR'
  },

  energiesGenerated: [
    [
      { energyType: 'energy', amount: 5, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 10, share: 0 },
      { energyType: 'forte', amount: 1, share: 0 }
    ],
    [
      { energyType: 'energy', amount: 5, share: 0.5, scalingStat: 'energyPercent' },
    ]
  ],
  energiesCost: [],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [1, 1],
    toughness: [0.45, 0.45],
    offtune: [0.36, 0.36]
  }
}

export const outro: Action = {
  name: 'Whispering Breeze',
  displayName: 'Outro',
  castTime: 0,
  multipliers: [], // TODO: handle empty lists for non damage actions?
  scaling: '', // TODO: handle empty strings for non damage actions?
  elements: [], // TODO: handle empty lists for non damage actions?
  dmgTypes: [], // TODO: handle empty lists for non damage actions?
  cooldown: 0,

  castConditions: {
    position: '', // TODO: handle empty strings as 'no requirements'
    previousAction: '',
    endState: '', // TODO: handle empty strings as 'all states available'
  },

  energiesGenerated: [
    [
      { energyType: 'energy', amount: 5, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 10, share: 0 }
    ],
    [
      { energyType: 'energy', amount: 5, share: 0.5, scalingStat: 'energyPercent' },
    ]
  ],
  energiesCost: [],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [1, 1],
    toughness: [0.45, 0.45],
    offtune: [0.36, 0.36]
  }
}

// TODO: test cast times, and make versions for: default & swap-cancel
// TODO: Define custom selectors: when hovering/clicking on actions with multiple versions, a new box should appear on top of it where you select which version
  // (this will let us avoid overcrowding the selector - same can be done with Basics instead of having an entry per version of basic attacks)
  // This should be forced on Character selection (if you just used a SWAP version, you cannot use the same character in the next row/snapshot)
  