import type { CharacterStats } from '../../types/stats'

// ========== Echo Cost Base Data ==============================================================================================
export const ECHO_COST_BASE_DATA: Record<1 | 3 | 4, { alwaysStats: Partial<CharacterStats>, mainStatOptions: Partial<CharacterStats>[] }> = {
  1: {
    alwaysStats: {
      flatHP: 2280,
    },
    mainStatOptions: [
      { bonusHP: 0.228 },
      { bonusATK: 0.18 },
      { bonusDEF: 0.18 },
    ],
  },
  3: {
    alwaysStats: {
      flatATK: 100,
    },
    mainStatOptions: [
      { bonusHP: 0.30 },
      { bonusATK: 0.30 },
      { bonusDEF: 0.38 },
      { glacioBonusDMG: 0.30 },
      { fusionBonusDMG: 0.30 },
      { electroBonusDMG: 0.30 },
      { aeroBonusDMG: 0.30 },
      { spectroBonusDMG: 0.30 },
      { havocBonusDMG: 0.30 },
      { energyPercent: 0.32 },
    ],
  },
  4: {
    alwaysStats: {
      flatATK: 150,
    },
    mainStatOptions: [
      { bonusHP: 0.33 },
      { bonusATK: 0.33 },
      { bonusDEF: 0.415 },
      { critRate: 0.22 },
      { critDamage: 0.44 },
    ],
  },
}

// ========== Echo Substat Possible Values =====================================================================================
export const ECHO_SUBSTAT_VALUES: Partial<Record<keyof CharacterStats, number[]>> = {
  flatATK:              [30, 40, 50, 60],
  flatHP:               [320, 360, 390, 430, 470, 510, 540, 580],
  flatDEF:              [40, 50, 60, 70],
  bonusDEF:             [0.081, 0.090, 0.100, 0.109, 0.118, 0.128, 0.138, 0.147],
  bonusATK:             [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116],
  bonusHP:              [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116],
  liberationBonusDMG:   [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116],
  heavyBonusDMG:        [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116],
  skillBonusDMG:        [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116],
  basicBonusDMG:        [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116],
  energyPercent:        [0.068, 0.076, 0.084, 0.092, 0.100, 0.108, 0.116, 0.124],
  critRate:             [0.063, 0.069, 0.075, 0.081, 0.087, 0.093, 0.099, 0.105],
  critDamage:           [0.126, 0.138, 0.150, 0.162, 0.174, 0.186, 0.198, 0.210],
}
