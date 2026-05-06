/**
 * Static definitions for echo main stat options and substat pools.
 * Used by the echo picker to populate the stat editor when creating a custom echo.
 */

import type { CharacterStats } from '../../types/stats'

// ========== Types ============================================================================================================

export type MainStatOption = {
  key: keyof CharacterStats
  label: string
  value: number
}

export type SubStatOption = {
  key: keyof CharacterStats
  label: string
  /** All possible rolled values for this substat (max tune). */
  values: number[]
  isPercent: boolean
}

// ========== Main Stat Options ================================================================================================
// Games values at Level 25 (max tune). The fixed component (flatATK or flatHP) is not listed here —
// it is added by buildBaseStats() separately.

export const MAIN_STAT_OPTIONS: Record<1 | 3 | 4, MainStatOption[]> = {
  4: [
    { key: 'critRate',           label: 'Crit Rate',       value: 0.22  },
    { key: 'critDamage',         label: 'Crit DMG',        value: 0.44  },
    { key: 'bonusATK',           label: 'ATK%',            value: 0.33  },
    { key: 'bonusHP',            label: 'HP%',             value: 0.30  },
    { key: 'bonusDEF',           label: 'DEF%',            value: 0.30  },
    { key: 'aeroBonusDMG',       label: 'Aero DMG',        value: 0.30  },
    { key: 'spectroBonusDMG',    label: 'Spectro DMG',     value: 0.30  },
    { key: 'glacioBonusDMG',     label: 'Glacio DMG',      value: 0.30  },
    { key: 'fusionBonusDMG',     label: 'Fusion DMG',      value: 0.30  },
    { key: 'electroBonusDMG',    label: 'Electro DMG',     value: 0.30  },
    { key: 'havocBonusDMG',      label: 'Havoc DMG',       value: 0.30  },
  ],
  3: [
    { key: 'bonusATK',           label: 'ATK%',            value: 0.30  },
    { key: 'bonusHP',            label: 'HP%',             value: 0.30  },
    { key: 'bonusDEF',           label: 'DEF%',            value: 0.30  },
    { key: 'energyPercent',      label: 'Energy Regen',    value: 0.32  },
    { key: 'basicBonusDMG',      label: 'Basic ATK DMG',   value: 0.30  },
    { key: 'heavyBonusDMG',      label: 'Heavy ATK DMG',   value: 0.30  },
    { key: 'skillBonusDMG',      label: 'Skill DMG',       value: 0.30  },
    { key: 'liberationBonusDMG', label: 'Liberation DMG',  value: 0.30  },
    { key: 'aeroBonusDMG',       label: 'Aero DMG',        value: 0.30  },
    { key: 'spectroBonusDMG',    label: 'Spectro DMG',     value: 0.30  },
    { key: 'glacioBonusDMG',     label: 'Glacio DMG',      value: 0.30  },
    { key: 'fusionBonusDMG',     label: 'Fusion DMG',      value: 0.30  },
    { key: 'electroBonusDMG',    label: 'Electro DMG',     value: 0.30  },
    { key: 'havocBonusDMG',      label: 'Havoc DMG',       value: 0.30  },
  ],
  1: [
    { key: 'bonusATK',           label: 'ATK%',            value: 0.18  },
    { key: 'bonusHP',            label: 'HP%',             value: 0.18  },
    { key: 'bonusDEF',           label: 'DEF%',            value: 0.18  },
  ],
}

// ========== Substat Pool =====================================================================================================
// Values are the possible max-tune rolled values seen in game.

export const SUBSTAT_OPTIONS: SubStatOption[] = [
  { key: 'critRate',           label: 'Crit Rate',       isPercent: true,  values: [0.063, 0.069, 0.075, 0.081, 0.087, 0.093, 0.099, 0.105]  },
  { key: 'critDamage',         label: 'Crit DMG',        isPercent: true,  values: [0.126, 0.138, 0.150, 0.162, 0.174, 0.186, 0.198, 0.210]  },
  { key: 'bonusATK',           label: 'ATK%',            isPercent: true,  values: [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116]  },
  { key: 'bonusHP',            label: 'HP%',             isPercent: true,  values: [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116]  },
  { key: 'bonusDEF',           label: 'DEF%',            isPercent: true,  values: [0.081, 0.090, 0.100, 0.109, 0.118, 0.128, 0.138, 0.147]  },
  { key: 'flatATK',            label: 'ATK',             isPercent: false, values: [30, 40, 50, 60]                                           },
  { key: 'flatHP',             label: 'HP',              isPercent: false, values: [320, 360, 390, 430, 470, 510, 540, 580]                   },
  { key: 'flatDEF',            label: 'DEF',             isPercent: false, values: [40, 50, 60, 70]                                           },
  { key: 'energyPercent',      label: 'Energy Regen',    isPercent: true,  values: [0.068, 0.076, 0.084, 0.092, 0.100, 0.108, 0.116, 0.124]  },
  { key: 'basicBonusDMG',      label: 'Basic ATK DMG',   isPercent: true,  values: [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116]  },
  { key: 'heavyBonusDMG',      label: 'Heavy ATK DMG',   isPercent: true,  values: [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116]  },
  { key: 'skillBonusDMG',      label: 'Skill DMG',       isPercent: true,  values: [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116]  },
  { key: 'liberationBonusDMG', label: 'Liberation DMG',  isPercent: true,  values: [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116]  },
]

// ========== Helper: assemble baseStats ========================================================================================

/**
 * Builds the `baseStats` object for a custom echo.
 * Combines the cost-tier's fixed flat stat with the chosen main stat.
 *   - Cost 4: flatATK 150
 *   - Cost 3: flatATK 100
 *   - Cost 1: flatHP 2280
 */
export function buildBaseStats(
  cost: 1 | 3 | 4,
  mainStatKey: keyof CharacterStats,
  mainStatValue: number,
): Partial<CharacterStats> {
  const fixed: Partial<CharacterStats> =
    cost === 4 ? { flatATK: 150 } :
    cost === 3 ? { flatATK: 100 } :
                 { flatHP: 2280 }
  return { ...fixed, [mainStatKey]: mainStatValue }
}

// ========== Helper: format stat value for display ============================================================================

export function formatSubstatValue(value: number, isPercent: boolean): string {
  return isPercent ? `${(value * 100).toFixed(1)}%` : String(value)
}
