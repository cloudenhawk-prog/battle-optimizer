import type { NegativeStatus } from "../types/negativeStatus"

// ========== Negative Statuses ================================================================================================

export const negativeStatuses: Record<string, NegativeStatus> = {
  aeroErosion: {
    name: "Aero Erosion",
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
    element: "AERO",
    reductionStrategy: {
      stackConsumption: 999,
      triggerDmgOnReduction: false,
      resetTimerOnApplication: true,
    },
    damageModifiers: []
  },
  spectroFrazzle: {
    name: "Spectro Frazzle",
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
    element: "SPECTRO",
    reductionStrategy: {
      stackConsumption: 1,
      triggerDmgOnReduction: true,
      resetTimerOnApplication: false,
    },
    damageModifiers: []
  }
}
