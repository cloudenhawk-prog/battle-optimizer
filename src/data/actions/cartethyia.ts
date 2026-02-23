import type { DamageType, ElementType, Position, ScalingType } from "../../types/baseTypes"
import type { EnergyCost, EnergyGeneration } from "../../types/energy"
import type { DamageModifier } from "../../types/modifiers"
import type { SideEffect, StatusModification } from "../../types/sideEffect"
import { buildBasicAction, repeatEnergy, type BasicsData } from "../../utils/data-builders/basics"

type CastConditions = {
  position: Position
  previousAction: string
  endState: Position
}

type Other = {
  hardness: number[]
  toughness: number[]
  offtune: number[]
}

export type Action = {
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
          { energyType: 'concerto', amount: 0.98, share: 0 }
        ]
      ],
      statusModifications: [],
      damageModifiers: [],
      sideEffects: [],
      other: {
        hardness: [1],
        toughness: [0.28],
        offtune: [0.224]
      }
    },

    2: {
      multipliers: [0.0394, 0.0394, 0.0525],
      energiesGenerated: [
        [
          { energyType: 'energy', amount: 0.58, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 0.81, share: 0 }
        ],
        [
          { energyType: 'energy', amount: 0.58, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 0.81, share: 0 }
        ],
        [
          { energyType: 'energy', amount: 0.77, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 1.08, share: 0 }
        ]
      ],
      statusModifications: [],
      damageModifiers: [],
      sideEffects: [],
      other: {
        hardness: [1, 1, 1],
        toughness: [0.2304, 0.2304, 0.3072],
        offtune: [0.1844, 0.1844, 0.2458]
      }
    },

    3: {
      multipliers: [0.0428, 0.0428, 0.0428, 0.0428],
      energiesGenerated: repeatEnergy(4, [
        { energyType: 'energy', amount: 0.63, share: 0.5, scalingStat: 'energyPercent' },
        { energyType: 'concerto', amount: 0.88, share: 0 }
      ]),
      statusModifications: [],
      damageModifiers: [],
      sideEffects: [],
      other: {
        hardness: [1, 1, 1, 1],
        toughness: [0.2505, 0.2505, 0.2505, 0.2505],
        offtune: [0.2004, 0.2004, 0.2004, 0.2004]
      }
    },

    4: {
      multipliers: [0.0252, 0.0252, 0.0252, 0.0754],
      energiesGenerated: [
        [
          { energyType: 'energy', amount: 0.37, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 0.52, share: 0 }
        ],
        [
          { energyType: 'energy', amount: 0.37, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 0.52, share: 0 }
        ],
        [
          { energyType: 'energy', amount: 0.37, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 0.52, share: 0 }
        ],
        [
          { energyType: 'energy', amount: 1.11, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 1.55, share: 0 }
        ]
      ],
      statusModifications: [],
      damageModifiers: [],
      sideEffects: [],
      other: {
        hardness: [1, 1, 1, 1],
        toughness: [0.1474, 0.1474, 0.1474, 0.442],
        offtune: [0.1179, 0.1179, 0.1179, 0.3536]
      }
    }
  }
}

export const basic_1_4: Action = buildBasicAction({
  name: 'Basic Attack 1-4',
  displayName: 'Basic Attack 1-4',
  basics,
  fromStage: 1,
  toStage: 4
})

export const basic_2_4: Action = buildBasicAction({
  name: 'Basic Attack 2-4',
  displayName: 'Basic Attack 2-4',
  basics,
  fromStage: 2,
  toStage: 4
})

// ========== Forte ===========================================================================================================

// ========== Skill ===========================================================================================================


// ========== Liberation ======================================================================================================


// ========== Intro & Outro ===================================================================================================
