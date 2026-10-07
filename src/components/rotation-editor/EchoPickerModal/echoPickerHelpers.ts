// Echo picker helpers: substat rows, cost badge colors/labels, stat icons/colors and the Echo builder
import type { Echo } from '../../../types/gear'
import type { CharacterStats } from '../../../types/stats'
import type { EchoCatalogEntry } from '../../../data/gear/echoCatalog'
import { MAIN_STAT_OPTIONS, SUBSTAT_OPTIONS, buildBaseStats } from '../../../data/gear/echoStats'

// ========== Substat Rows =====================================================================================================

export type SubstatRow = { key: string; value: string }

// Five empty substat rows; callers copy it (EMPTY_SUBSTATS.map(r => ({ ...r }))) before editing
export const EMPTY_SUBSTATS: SubstatRow[] = [
  { key: '', value: '' },
  { key: '', value: '' },
  { key: '', value: '' },
  { key: '', value: '' },
  { key: '', value: '' },
]

// ========== Helpers ==========================================================================================================

export function costLabel(cost: 1 | 3 | 4): string {
  return cost === 4 ? '4 Cost' : cost === 3 ? '3 Cost' : '1 Cost'
}

export function costBadgeColor(cost: 1 | 3 | 4): string {
  return cost === 4 ? 'hsl(45 100% 55%)' : cost === 3 ? 'hsl(195 80% 55%)' : 'hsl(195 20% 50%)'
}

export function setIconPath(setName: string): string {
  return `/assets/gear/set-bonuses/${setName.toLowerCase().replace(/\s+/g, '_')}.png`
}

// ========== Stat Icon Paths & Colors =========================================================================================

export const STAT_ICON_PATHS: Record<string, string> = {
  critRate:           '/assets/stat-labels/statLabel_critRate.png',
  critDamage:         '/assets/stat-labels/statLabel_critDamage.png',
  bonusATK:           '/assets/stat-labels/statLabel_ATK.png',
  bonusHP:            '/assets/stat-labels/statLabel_HP.png',
  bonusDEF:           '/assets/stat-labels/statLabel_DEF.png',
  flatATK:            '/assets/stat-labels/statLabel_ATK.png',
  flatHP:             '/assets/stat-labels/statLabel_HP.png',
  flatDEF:            '/assets/stat-labels/statLabel_DEF.png',
  energyPercent:      '/assets/stat-labels/statLabel_energyPercent.png',
  basicBonusDMG:      '/assets/stat-labels/statLabel_basicBonusDMG.png',
  heavyBonusDMG:      '/assets/stat-labels/statLabel_heavyBonusDMG.png',
  skillBonusDMG:      '/assets/stat-labels/statLabel_skillBonusDMG.png',
  liberationBonusDMG: '/assets/stat-labels/statLabel_liberationBonusDMG.png',
  aeroBonusDMG:       '/assets/stat-labels/statLabel_aeroBonusDMG.png',
  spectroBonusDMG:    '/assets/stat-labels/statLabel_spectroBonusDMG.png',
  glacioBonusDMG:     '/assets/stat-labels/statLabel_glacioBonusDMG.png',
  fusionBonusDMG:     '/assets/stat-labels/statLabel_fusionBonusDMG.png',
  electroBonusDMG:    '/assets/stat-labels/statLabel_electroBonusDMG.png',
  havocBonusDMG:      '/assets/stat-labels/statLabel_havocBonusDMG.png',
}

export const STAT_COLORS: Record<string, string> = {
  critRate:           'hsl(45 100% 68%)',
  critDamage:         'hsl(45 100% 68%)',
  energyPercent:      'hsl(195 80% 62%)',
  aeroBonusDMG:       'hsl(160 80% 58%)',
  spectroBonusDMG:    'hsl(45 100% 65%)',
  glacioBonusDMG:     'hsl(200 100% 72%)',
  fusionBonusDMG:     'hsl(15 100% 60%)',
  electroBonusDMG:    'hsl(280 100% 68%)',
  havocBonusDMG:      'hsl(270 80% 65%)',
  basicBonusDMG:      'hsl(180 55% 65%)',
  heavyBonusDMG:      'hsl(180 55% 65%)',
  skillBonusDMG:      'hsl(180 55% 65%)',
  liberationBonusDMG: 'hsl(180 55% 65%)',
}

export function getStatColor(key: string): string {
  return STAT_COLORS[key] ?? 'rgba(200, 215, 235, 0.9)'
}

// ========== Substat Editing ==================================================================================================

// Returns a copy of `prev` with one field of row `index` changed. Picking a substat key pre-selects its
// 4th roll value (or the highest when fewer exist); clearing the key clears the value.
export function applySubstatChange(prev: SubstatRow[], index: number, field: 'key' | 'value', val: string): SubstatRow[] {
  const next = prev.map(r => ({ ...r }))
  next[index] = { ...next[index], [field]: val }
  if (field === 'key') {
    if (val) {
      const option = SUBSTAT_OPTIONS.find(o => o.key === val)
      const defaultIdx = Math.min(3, (option?.values.length ?? 1) - 1)
      next[index].value = option ? String(option.values[defaultIdx]) : ''
    } else {
      next[index].value = ''
    }
  }
  return next
}

// ========== Echo Builder =====================================================================================================

// Builds the equipped Echo from a catalog entry + chosen stats. Returns null when the main stat is invalid.
// Duplicate substat keys are summed; firstSlotStats only carry over when equipping into slot 1.
export function buildEchoFromSelection(entry: EchoCatalogEntry, slot: 1 | 2 | 3 | 4 | 5, mainStatKey: string, substats: SubstatRow[]): Echo | null {
  const cost = entry.cost as 1 | 3 | 4
  const mainOption = MAIN_STAT_OPTIONS[cost].find(o => o.key === mainStatKey)
  if (!mainOption) return null

  const subStatsObj: Partial<CharacterStats> = {}
  for (const sub of substats) {
    if (!sub.key || !sub.value) continue
    const num = parseFloat(sub.value)
    if (isNaN(num)) continue
    const existing = (subStatsObj[sub.key as keyof CharacterStats] as number | undefined) ?? 0
    ;(subStatsObj as Record<string, number>)[sub.key] = existing + num
  }

  return {
    name: entry.name,
    setName: entry.setName,
    cost: entry.cost,
    icon: entry.icon,
    info_icon: entry.info_icon,
    info: entry.info,
    baseStats: buildBaseStats(cost, mainOption.key, mainOption.value),
    subStats: subStatsObj,
    ...(slot === 1 && entry.firstSlotStats
      ? { firstSlotStats: entry.firstSlotStats }
      : {}),
    ...(entry.echoSkill ? { echoSkill: entry.echoSkill } : {}),
    ...(entry.injectedModifiers ? { injectedModifiers: entry.injectedModifiers } : {}),
    ...(entry.injectedSideEffects ? { injectedSideEffects: entry.injectedSideEffects } : {}),
    ...(entry.conditionalStats ? { conditionalStats: entry.conditionalStats } : {}),
  }
}
