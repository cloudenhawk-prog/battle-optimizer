import type { NegativeStatus } from '../types/negativeStatus'

// ========== Negative Statuses ================================================================================================

export const negativeStatuses: Record<string, NegativeStatus> = {
  aeroErosion: {
    name: 'Aero Erosion',
    duration: 15,
    maxStacksDefault: 3,
    frequency: 3,
    damage: {
      1: 1654,
      2: 4134,
      3: 8268,
      4: 12402,
      5: 16536,
      6: 20670,
      7: 24804,
      8: 28938,
      9: 33072,
    },
    element: 'AERO',
    reductionStrategy: {
      stackConsumption: 999,
      triggerDmgOnReduction: false,
      resetTimerOnApplication: true,
    },
    damageModifiers: [],
    color: '#4db84d',
  },
  spectroFrazzle: {
    name: 'Spectro Frazzle',
    duration: 12,
    maxStacksDefault: 10,
    frequency: 3,
    damage: {
      1: 1225,
      2: 2223,
      3: 2896,
      4: 3792,
      5: 4688,
      6: 5584,
      7: 6480,
      8: 8196,
      9: 9192,
      10: 10188,
    },
    element: 'SPECTRO',
    reductionStrategy: {
      stackConsumption: 1,
      triggerDmgOnReduction: true,
      resetTimerOnApplication: false,
    },
    damageModifiers: [],
    color: '#ffe066'
  },
  glacioChafe: {
    name: 'Glacio Chafe',
    duration: 15,
    maxStacksDefault: 10,
    frequency: 3,
    damage: {
      1: 2450,
      2: 4442,
      3: 6434,
      4: 8426,
      5: 10417,
      6: 12409,
      7: 14401,
      8: 16393,
      9: 18385,
      10: 20377,
      11: 27169,
      12: 33961,
      13: 40753
    },
    element: 'GLACIO',
    reductionStrategy: {
      stackConsumption: 999,
      triggerDmgOnReduction: false,
      resetTimerOnApplication: true,
    },
    damageModifiers: [],
    color: '#66ccff'
  },
  glacioBite: {
    name: 'Glacio Bite',
    duration: 15,
    maxStacksDefault: 10,
    frequency: 3,
    damage: {
      1: 2450,
      2: 4442,
      3: 6434,
      4: 8426,
      5: 10417,
      6: 12409,
      7: 14401,
      8: 16393,
      9: 18385,
      10: 20377,
      11: 27169,
      12: 33961,
      13: 40753
    },
    element: 'GLACIO',
    reductionStrategy: {
      stackConsumption: 999,
      triggerDmgOnReduction: false,
      resetTimerOnApplication: true,
    },
    damageModifiers: [],
    color: '#66ccff'
  }
}
