// Builds the per-source breakdown (weapon, echoes, set, passives, buffs) shown in the stat breakdown modal
import type { CharacterStats } from '../../../types/stats'
import { calculateScalingStat } from '../../../engine/damage/damageCalculator'
import type { ActiveModifierBreakdown, GearStatBreakdown } from '../../../engine/gear/computeStatBreakdown'
import { SCALING_STAT_KEYS, type StatDisplay } from './statDisplay'

// ========== Breakdown Data Types =============================================================================================

export type BreakdownGroup = {
  key: string
  groupName: string
  total: number
  items: Array<{ name: string; value: number }>
}

// Scaling stats (ATK/HP/DEF) split into %-of-base and flat tables; every other stat is a single additive table
export type StatBreakdownData = { variant: 'scaling'; stat: 'ATK' | 'HP' | 'DEF'; finalValue: number; baseValue: number; percentGroups: BreakdownGroup[]; flatGroups: BreakdownGroup[] } | { variant: 'additive'; key: string; label: string; format: StatDisplay['format']; finalValue: number; groups: BreakdownGroup[] }

// One group per source; items with a zero contribution are dropped
function buildGroups(extractValue: (stats: Partial<CharacterStats>) => number, gearBreakdown: GearStatBreakdown, activeBreakdown: ActiveModifierBreakdown): BreakdownGroup[] {
  const weaponVal = extractValue(gearBreakdown.weapon.total)
  const echoesTotal = extractValue(gearBreakdown.echoes.total)
  const echoItems = gearBreakdown.echoes.items.map(e => ({ name: e.name, value: extractValue(e.stats) })).filter(i => i.value !== 0)
  const setBonusVal = gearBreakdown.setBonus ? extractValue(gearBreakdown.setBonus.total) : 0
  const setBonusItems = gearBreakdown.setBonus && setBonusVal !== 0 ? [{ name: gearBreakdown.setBonus.name, value: setBonusVal }] : []
  const passiveTotal = extractValue(gearBreakdown.passiveMods.total)
  const passiveItems = gearBreakdown.passiveMods.items.map(m => ({ name: m.name, value: extractValue(m.stats) })).filter(i => i.value !== 0)
  const selfTotal = extractValue(activeBreakdown.selfBuffs.total)
  const selfItems = activeBreakdown.selfBuffs.items.map(m => ({ name: m.name, value: extractValue(m.stats) })).filter(i => i.value !== 0)
  const teamTotal = extractValue(activeBreakdown.teamBuffs.total)
  const teamItems = activeBreakdown.teamBuffs.items.map(m => ({ name: m.name, value: extractValue(m.stats) })).filter(i => i.value !== 0)

  return [
    { key: 'weapon', groupName: 'Weapon', total: weaponVal, items: weaponVal !== 0 ? [{ name: gearBreakdown.weapon.name, value: weaponVal }] : [] },
    { key: 'echoes', groupName: 'Echoes', total: echoesTotal, items: echoItems },
    { key: 'setBonus', groupName: 'Set Bonus', total: setBonusVal, items: setBonusItems },
    { key: 'passiveMods', groupName: 'Passives', total: passiveTotal, items: passiveItems },
    { key: 'selfBuffs', groupName: 'Self Buffs', total: selfTotal, items: selfItems },
    { key: 'teamBuffs', groupName: 'Team Buffs', total: teamTotal, items: teamItems },
  ]
}

export function getBreakdownData(statKey: string, label: string, format: StatDisplay['format'], finalStats: CharacterStats, gearBreakdown: GearStatBreakdown, activeBreakdown: ActiveModifierBreakdown, baseStat: CharacterStats): StatBreakdownData {
  if (SCALING_STAT_KEYS.has(statKey)) {
    const s = statKey as 'ATK' | 'HP' | 'DEF'
    const baseKey = `base${s}` as keyof CharacterStats
    const bonusKey = `bonus${s}` as keyof CharacterStats
    const flatKey = `flat${s}` as keyof CharacterStats

    return {
      variant: 'scaling',
      stat: s,
      finalValue: calculateScalingStat(finalStats, s),
      baseValue: (baseStat[baseKey] as number) ?? 0,
      percentGroups: buildGroups(stats => (stats[bonusKey] as number | undefined) ?? 0, gearBreakdown, activeBreakdown),
      flatGroups: buildGroups(stats => (stats[flatKey] as number | undefined) ?? 0, gearBreakdown, activeBreakdown),
    }
  }

  const k = statKey as keyof CharacterStats
  const getVal = (stats: Partial<CharacterStats>): number => (stats[k] as number | undefined) ?? 0

  // Base = the residual after subtracting all gear/buff contributions from character.stats.
  // This captures the character's own definition + game defaults without double-counting gear.
  // e.g. critRate: 0.05 default + any char-level stat; energyPercent: 1.0 for Cartethyia.
  const resolvedBase = (baseStat[k] as number) ?? 0
  const charBase = resolvedBase - getVal(gearBreakdown.weapon.total) - getVal(gearBreakdown.echoes.total) - (gearBreakdown.setBonus ? getVal(gearBreakdown.setBonus.total) : 0) - getVal(gearBreakdown.passiveMods.total)

  return {
    variant: 'additive',
    key: statKey,
    label,
    format,
    finalValue: (finalStats[k] as number) ?? 0,
    groups: [{ key: 'base', groupName: 'Base', total: charBase, items: [] }, ...buildGroups(getVal, gearBreakdown, activeBreakdown)],
  }
}
