import type { CharacterStats } from '../../types/stats'



export const yangyang = {
  name: 'Yangyang', // Can include 'display name' later if desired
  actions: [], // Can apply status modifications (give them types like buffs/debuffs - and also passive: permanent, timed, other types)
  maxEnergies: { energy: 100, concerto: 100, forte: 3 }, // Can be grabbed from liberation cost later
  baseStats: stats,
  inherentStats: {},
  gear: {
    weapon: {},
    echoes: [],
  }
}

const stats: CharacterStats = { // Any way to only need to fill out the ones used - everything else uses default values?
  level: 90,

  baseATK: 250,
  flatATK: 0,
  bonusATK: 0,
  amplifyATK: 0,
  totalMultiplierATK: 1,

  baseHP: 10200,
  flatHP: 0,
  bonusHP: 0,
  amplifyHP: 0,
  totalMultiplierHP: 1,

  baseDEF: 1099,
  flatDEF: 0,
  bonusDEF: 0,
  amplifyDEF: 0,
  totalMultiplierDEF: 1,

  critRate: 0.05,
  critDamage: 1.50,

  bonusDMG: 0,
  amplifyDMG: 0,
  totalMultiplierDMG: 1,

  defIgnore: 0,
  elementalResPEN: 0,
  resistancePEN: 0,

  basicBonusDMG: 0,
  basicAmplifyDMG: 0,
  basicTotalMultiplierDMG: 1,
  heavyBonusDMG: 0,
  heavyAmplifyDMG: 0,
  heavyTotalMultiplierDMG: 1,
  skillBonusDMG: 0,
  skillAmplifyDMG: 0,
  skillTotalMultiplierDMG: 1,
  liberationBonusDMG: 0,
  liberationAmplifyDMG: 0,
  liberationTotalMultiplierDMG: 1,
  coordinatedBonusDMG: 0,
  coordinatedAmplifyDMG: 0,
  coordinatedTotalMultiplierDMG: 1,
  echoBonusDMG: 0,
  echoAmplifyDMG: 0,
  echoTotalMultiplierDMG: 1,
  introBonusDMG: 0,
  introAmplifyDMG: 0,
  introTotalMultiplierDMG: 1,
  outroBonusDMG: 0,
  outroAmplifyDMG: 0,
  outroTotalMultiplierDMG: 1,

  aeroErosionBonusDMG: 0,
  aeroErosionAmplifyDMG: 0,
  aeroErosionTotalMultiplierDMG: 1,
  spectroFrazzleBonusDMG: 0,
  spectroFrazzleAmplifyDMG: 0,
  spectroFrazzleTotalMultiplierDMG: 1,
  havocBaneBonusDMG: 0,
  havocBaneAmplifyDMG: 0,
  havocBaneTotalMultiplierDMG: 1,
  glacioChafeBonusDMG: 0,
  glacioChafeAmplifyDMG: 0,
  glacioChafeTotalMultiplierDMG: 1,
  fusionBurstBonusDMG: 0,
  fusionBurstAmplifyDMG: 0,
  fusionBurstTotalMultiplierDMG: 1,
  electroFlareBonusDMG: 0,
  electroFlareAmplifyDMG: 0,
  electroFlareTotalMultiplierDMG: 1,

  spectroBonusDMG: 0,
  spectroAmplifyDMG: 0,
  spectroTotalMultiplierDMG: 1,
  fusionBonusDMG: 0,
  fusionAmplifyDMG: 0,
  fusionTotalMultiplierDMG: 1,
  aeroBonusDMG: 0,
  aeroAmplifyDMG: 0,
  aeroTotalMultiplierDMG: 1,
  glacioBonusDMG: 0,
  glacioAmplifyDMG: 0,
  glacioTotalMultiplierDMG: 1,
  electroBonusDMG: 0,
  electroAmplifyDMG: 0,
  electroTotalMultiplierDMG: 1,
  havocBonusDMG: 0,
  havocAmplifyDMG: 0,
  havocTotalMultiplierDMG: 1,

  energyPercent: 1.0
}

const basics = {
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  castCapabilities: ['GROUND'],
  endState: 'GROUND',
  stages: {
    1: {
      multiplier: [0.4473],
      energiesGenerated: [
        [
          { energyType: 'energy', amount: 0.75, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 2.4, share: 0 }
        ]
      ],
      energiesCost: [],
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
      multiplier: [0.5964],
      energiesGenerated: [
        [
          { energyType: 'energy', amount: 1.00, share: 0.5, scalingStat: 'energyPercent' },
          { energyType: 'concerto', amount: 3.2, share: 0 }
        ]
      ],
      energiesCost: [],
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
      multiplier: [0.4681, 0.4681],
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
      energiesCost: [],
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
          { energyType: 'concerto', amount: 3.18, share: 0 }
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
      energiesCost: [],
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

const heavy_1 = {
  name: 'Heavy Attack',
  displayName: 'Heavy Attack',
  castTime: 0,
  multipliers: [0.1988, 0.1988, 0.1988],
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,
  castCapabilities: ['GROUND'],
  endState: 'GROUND',

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

const heavy_2 = {
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
      { energyType: 'concerto', amount: 5.72, share: 0 }
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

