// Stat display definitions (stat list, gear stat labels, current-stat groups) and number formatting
import type { CharacterStats } from '../../../types/stats'
import { calculateScalingStat } from '../../../engine/damage/damageCalculator'

// ========== Stat Display Config ==============================================================================================

export type StatDisplay = {
  key: string
  label: string
  format: 'flat' | 'percent' | 'integer'
  iconPath?: string
  elementClass?: string
}

// Rows of the 'Total Stats' list, in display order. elementClass tints the icon per element.
export const STAT_DISPLAY: StatDisplay[] = [
  { key: 'ATK', label: 'ATK', format: 'flat', iconPath: '/assets/stat-labels/statLabel_ATK.png' },
  { key: 'HP', label: 'HP', format: 'flat', iconPath: '/assets/stat-labels/statLabel_HP.png' },
  { key: 'DEF', label: 'DEF', format: 'flat', iconPath: '/assets/stat-labels/statLabel_DEF.png' },
  { key: 'critRate', label: 'Crit Rate', format: 'percent', iconPath: '/assets/stat-labels/statLabel_critRate.png' },
  { key: 'critDamage', label: 'Crit DMG', format: 'percent', iconPath: '/assets/stat-labels/statLabel_critDamage.png' },
  { key: 'energyPercent', label: 'Energy Regen', format: 'percent', iconPath: '/assets/stat-labels/statLabel_energyPercent.png' },
  { key: 'basicBonusDMG', label: 'Basic Attack DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_basicBonusDMG.png' },
  { key: 'heavyBonusDMG', label: 'Heavy Attack DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_heavyBonusDMG.png' },
  { key: 'skillBonusDMG', label: 'Resonance Skill DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_skillBonusDMG.png' },
  { key: 'liberationBonusDMG', label: 'Resonance Liberation DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_liberationBonusDMG.png' },
  { key: 'glacioBonusDMG', label: 'Glacio DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_glacioBonusDMG.png', elementClass: 'charStatRow--glacio' },
  { key: 'fusionBonusDMG', label: 'Fusion DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_fusionBonusDMG.png', elementClass: 'charStatRow--fusion' },
  { key: 'electroBonusDMG', label: 'Electro DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_electroBonusDMG.png', elementClass: 'charStatRow--electro' },
  { key: 'aeroBonusDMG', label: 'Aero DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_aeroBonusDMG.png', elementClass: 'charStatRow--aero' },
  { key: 'spectroBonusDMG', label: 'Spectro DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_spectroBonusDMG.png', elementClass: 'charStatRow--spectro' },
  { key: 'havocBonusDMG', label: 'Havoc DMG Bonus', format: 'percent', iconPath: '/assets/stat-labels/statLabel_havocBonusDMG.png', elementClass: 'charStatRow--havoc' },
  { key: 'tuneBreakBoost', label: 'Tune Break Boost', format: 'percent', iconPath: '/assets/stat-labels/statLabel_tuneBreakBoost.png' },
  { key: 'offtuneBuildupRate', label: 'Off-Tune Buildup Rate', format: 'percent', iconPath: '/assets/stat-labels/statLabel_offtuneBuildupRate.png' },
]

// The three scaling stats need special handling via calculateScalingStat
export const SCALING_STAT_KEYS = new Set(['ATK', 'HP', 'DEF'])

// ========== Gear Stat Display ================================================================================================

// Short labels for raw gear stat keys (weapon/echo detail lists)
const GEAR_STAT_LABELS: Record<string, { label: string; format: StatDisplay['format'] }> = {
  bonusATK: { label: 'ATK%', format: 'percent' },
  bonusHP: { label: 'HP%', format: 'percent' },
  bonusDEF: { label: 'DEF%', format: 'percent' },
  flatATK: { label: 'ATK', format: 'flat' },
  flatHP: { label: 'HP', format: 'flat' },
  flatDEF: { label: 'DEF', format: 'flat' },
  baseATK: { label: 'Base ATK', format: 'flat' },
  baseHP: { label: 'Base HP', format: 'flat' },
  baseDEF: { label: 'Base DEF', format: 'flat' },
  critRate: { label: 'Crit Rate', format: 'percent' },
  critDamage: { label: 'Crit DMG', format: 'percent' },
  energyPercent: { label: 'Energy Regen', format: 'percent' },
  healingBonus: { label: 'Healing Bonus', format: 'percent' },
  glacioBonusDMG: { label: 'Glacio DMG', format: 'percent' },
  fusionBonusDMG: { label: 'Fusion DMG', format: 'percent' },
  electroBonusDMG: { label: 'Electro DMG', format: 'percent' },
  aeroBonusDMG: { label: 'Aero DMG', format: 'percent' },
  spectroBonusDMG: { label: 'Spectro DMG', format: 'percent' },
  havocBonusDMG: { label: 'Havoc DMG', format: 'percent' },
  basicBonusDMG: { label: 'Basic ATK DMG', format: 'percent' },
  heavyBonusDMG: { label: 'Heavy ATK DMG', format: 'percent' },
  skillBonusDMG: { label: 'Skill DMG', format: 'percent' },
  liberationBonusDMG: { label: 'Liberation DMG', format: 'percent' },
  tuneBreakBoost: { label: 'Tune Break Boost', format: 'percent' },
  offtuneBuildupRate: { label: 'Off-Tune Buildup Rate', format: 'percent' },
}

export function formatGearStats(stats: Partial<CharacterStats>): Array<{ label: string; value: string }> {
  return Object.entries(stats)
    .filter(([, v]) => typeof v === 'number' && v !== 0)
    .flatMap(([k, v]) => {
      const entry = GEAR_STAT_LABELS[k]
      if (!entry) return []
      return [{ label: entry.label, value: formatStatValue(k, v as number, entry.format) }]
    })
}

// ========== Formatting =======================================================================================================

// Flat numbers use . as thousands separator (European style)
export function formatFlat(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function formatStatValue(_key: string, value: number, format: StatDisplay['format']): string {
  if (format === 'flat') return formatFlat(value)
  if (format === 'integer') return String(Math.round(value))
  // critDamage is stored as a multiplier (1.5 = 150% base, 2.75 = 275% total)
  // display it as value * 100 so 2.75 → 275.0%
  return (value * 100).toFixed(1) + '%'
}

// ========== Stat Groups for the Active Buffs Panel ==========================================================================

export const STAT_GROUPS: Array<{ label: string; keys: (keyof CharacterStats)[] }> = [
  {
    label: 'Base Stats',
    keys: ['level', 'baseATK', 'flatATK', 'bonusATK', 'amplifyATK', 'totalMultiplierATK', 'baseHP', 'flatHP', 'bonusHP', 'amplifyHP', 'totalMultiplierHP', 'baseDEF', 'flatDEF', 'bonusDEF', 'amplifyDEF', 'totalMultiplierDEF'],
  },
  {
    label: 'Combat',
    keys: ['critRate', 'critDamage', 'bonusDMG', 'amplifyDMG', 'totalMultiplierDMG', 'defIgnore', 'elementalResPEN', 'resistancePEN', 'healingBonus', 'energyPercent', 'tuneBreakBoost', 'offtuneBuildupRate'],
  },
  {
    label: 'Skill Types',
    keys: ['basicBonusDMG', 'basicAmplifyDMG', 'basicTotalMultiplierDMG', 'heavyBonusDMG', 'heavyAmplifyDMG', 'heavyTotalMultiplierDMG', 'skillBonusDMG', 'skillAmplifyDMG', 'skillTotalMultiplierDMG', 'liberationBonusDMG', 'liberationAmplifyDMG', 'liberationTotalMultiplierDMG', 'coordinatedBonusDMG', 'coordinatedAmplifyDMG', 'coordinatedTotalMultiplierDMG', 'echoBonusDMG', 'echoAmplifyDMG', 'echoTotalMultiplierDMG', 'introBonusDMG', 'introAmplifyDMG', 'introTotalMultiplierDMG', 'outroBonusDMG', 'outroAmplifyDMG', 'outroTotalMultiplierDMG'],
  },
  {
    label: 'Negative Status',
    keys: ['aeroErosionBonusDMG', 'aeroErosionAmplifyDMG', 'aeroErosionTotalMultiplierDMG', 'spectroFrazzleBonusDMG', 'spectroFrazzleAmplifyDMG', 'spectroFrazzleTotalMultiplierDMG', 'havocBaneBonusDMG', 'havocBaneAmplifyDMG', 'havocBaneTotalMultiplierDMG', 'glacioChafeBonusDMG', 'glacioChafeAmplifyDMG', 'glacioChafeTotalMultiplierDMG', 'fusionBurstBonusDMG', 'fusionBurstAmplifyDMG', 'fusionBurstTotalMultiplierDMG', 'electroFlareBonusDMG', 'electroFlareAmplifyDMG', 'electroFlareTotalMultiplierDMG'],
  },
  {
    label: 'Elemental',
    keys: ['aeroBonusDMG', 'aeroAmplifyDMG', 'aeroTotalMultiplierDMG', 'spectroBonusDMG', 'spectroAmplifyDMG', 'spectroTotalMultiplierDMG', 'fusionBonusDMG', 'fusionAmplifyDMG', 'fusionTotalMultiplierDMG', 'glacioBonusDMG', 'glacioAmplifyDMG', 'glacioTotalMultiplierDMG', 'electroBonusDMG', 'electroAmplifyDMG', 'electroTotalMultiplierDMG', 'havocBonusDMG', 'havocAmplifyDMG', 'havocTotalMultiplierDMG'],
  },
]

// Formats any CharacterStats key by naming convention: TotalMultiplier → x1.23, ratio-like keys → %, rest → flat
export function formatFinalStat(key: string, value: number): string {
  if (/TotalMultiplier/i.test(key)) {
    return 'x' + value.toFixed(2)
  }
  if (/Rate|Bonus|Amplify|PEN|Percent|Boost|Ignore|critDamage/i.test(key)) {
    return (value * 100).toFixed(1) + '%'
  }
  return formatFlat(value)
}

// Converts camelCase stat keys to readable labels, preserving acronyms (ATK, HP, DEF, DMG, etc.)
export function formatStatKeyLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/^./, s => s.toUpperCase())
    .trim()
}

// ========== Display Value ====================================================================================================

// Value shown in the 'Total Stats' list: ATK/HP/DEF are resolved via calculateScalingStat, the rest read directly
export function getStatDisplayValue(stat: StatDisplay, finalStats: CharacterStats): number {
  if (SCALING_STAT_KEYS.has(stat.key)) {
    return calculateScalingStat(finalStats, stat.key as 'ATK' | 'HP' | 'DEF')
  }
  return (finalStats[stat.key as keyof CharacterStats] as number) ?? 0
}
