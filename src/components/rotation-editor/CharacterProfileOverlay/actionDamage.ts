// Simplified per-action damage estimate (avg crit, current buffs, active enemy debuffs) for the Action DPS ranking
import type { Character } from '../../../types/character'
import type { Action } from '../../../types/action'
import type { DamageModifier } from '../../../types/modifiers'
import type { Snapshot } from '../../../types/snapshot'
import type { CharacterStats, EnemyStats } from '../../../types/stats'
import { calculateScalingStat, calculateBonusMultiplier, calculateAmplifyMultiplier, calculateTotalMultiplier } from '../../../engine/damage/damageCalculator'

// ========== Damage Formula ===================================================================================================
// Local copy of the engine's damage formula (no conditional modifiers); used only for this ranking display.

function calcDefenseMultiplier(attackerLevel: number, defenderLevel: number, defIgnore: number): number {
  const defenseValue = 8 * defenderLevel + 792
  const effectiveDefense = defenseValue * (1 - defIgnore)
  return (800 + 8 * attackerLevel) / (800 + 8 * attackerLevel + effectiveDefense)
}

function calcResistanceMultiplierValue(pen: number, resistance: number): number {
  const eff = resistance - pen
  if (eff < 0) return 1 - eff / 2
  if (eff < 0.8) return 1 - eff
  return 1 / (1 + 5 * eff)
}

// Average (crit-weighted) damage of one cast and damage per second of cast time
export function calcActionDamage(
  finalStats: CharacterStats,
  action: Action,
  enemyStats: EnemyStats,
): { damage: number; dps: number; multiplier: number } {
  const { scaling, dmgTypes, elements, multiplier: actionMultiplier, castTime } = action

  // For pure negative-status damage hits (multiplier = 0, NEGATIVE_STATUS only): skip
  if (actionMultiplier === 0 && dmgTypes.every(t => t === 'NEGATIVE_STATUS')) {
    return { damage: 0, dps: 0, multiplier: 0 }
  }

  const critRate = Math.min(finalStats.critRate, 1.0)
  const critMult = 1 + critRate * (finalStats.critDamage - 1)
  const baseStat = calculateScalingStat(finalStats, scaling)
  const bonusMult = calculateBonusMultiplier(finalStats, elements, dmgTypes)
  const amplifyMult = calculateAmplifyMultiplier(finalStats, elements, dmgTypes)
  const totalMult = calculateTotalMultiplier(finalStats, elements, dmgTypes)

  const defMult = calcDefenseMultiplier(finalStats.level, enemyStats.level, finalStats.defIgnore)
  const resMult = calcResistanceMultiplierValue(finalStats.resistancePEN, enemyStats.resistance)

  // Elemental resistance for the first non-empty element
  let elemResMult = 1
  const firstElem = elements.find(e => e !== '') ?? ''
  if (firstElem) {
    const elemResKey = `${firstElem.toLowerCase()}RES` as keyof EnemyStats
    const elemRes = (enemyStats[elemResKey] as number) ?? 0
    const effElemRes = elemRes - finalStats.elementalResPEN
    if (effElemRes < 0) elemResMult = 1 - effElemRes / 2
    else if (effElemRes < 0.8) elemResMult = 1 - effElemRes
    else elemResMult = 1 / (1 + 5 * effElemRes)
  }

  const damageTakenMult = 1 - enemyStats.damageReduction
  const resistanceMult = defMult * resMult * elemResMult * damageTakenMult
  const damage = Math.ceil(actionMultiplier * baseStat * bonusMult * amplifyMult * totalMult * resistanceMult * critMult)
  const dps = castTime > 0 ? damage / castTime : damage
  return { damage, dps, multiplier: actionMultiplier }
}

// ========== Enemy Debuffs ====================================================================================================

// Sums enemyStats changes (e.g. RES reduction) of every debuff active in the snapshot, scaled by stack count.
export function computeActiveEnemyMods(snapshot: Snapshot | null, allCharacters: Character[]): Partial<EnemyStats> {
  const activeEnemyMods: Partial<EnemyStats> = {}
  if (snapshot) {
    // Collect all modifier blueprints (same approach as computeActiveModifierBreakdown)
    const allModifiers: DamageModifier[] = []
    for (const char of allCharacters) {
      const push = (mod: DamageModifier) =>
        allModifiers.push({ ...mod, ownerCharacter: mod.ownerCharacter ?? char.name })
      for (const mod of char.damageModifiers ?? []) push(mod)
      for (const mod of char.flattenedPassiveModifiers ?? []) push(mod)
      for (const action of char.actions ?? []) {
        for (const mod of action.damageModifiers ?? []) push(mod)
        for (const ca of action.coordinatedAttacks ?? []) {
          for (const mod of ca.damageModifiers ?? []) push(mod)
        }
      }
    }
    for (const [key, stacks] of Object.entries(snapshot.debuffs)) {
      if (stacks <= 0) continue
      const mod = allModifiers.find(m => m.displayName.replace(/\s+/g, '') === key && m.type === 'debuff')
      if (!mod?.enemyStats) continue
      for (const [statKey, value] of Object.entries(mod.enemyStats)) {
        const k = statKey as keyof EnemyStats
        const cur = (activeEnemyMods[k] as number | undefined) ?? 0
        ;(activeEnemyMods as Record<string, number>)[statKey] = cur + (value as number) * stacks
      }
    }
  }
  return activeEnemyMods
}

// ========== Action Ranking ===================================================================================================

export type ActionEntry = {
  groupKey: string
  category: string
  variants: Array<{
    action: Action
    damage: number
    dps: number
  }>
  bestDps: number
  bestDamage: number
  topAction: Action
}

// Groups the character's actions by groupName (variants share a card), skipping testing actions, pure
// negative-status hits and swap/cancel stubs. Sorted by best DPS; variants inside a group sorted by DPS too.
export function buildActionEntries(character: Character, finalStats: CharacterStats, effectiveEnemyStats: EnemyStats): ActionEntry[] {
  const seen = new Set<string>()
  const entries: ActionEntry[] = []
  const skipCategories = new Set(['Testing'])
  // Actions with castTime at or below this threshold are swap/cancel stubs; DPS is not representative
  const MIN_CAST_FOR_DPS = 0.05

  for (const action of character.actions) {
    if (skipCategories.has(action.category)) continue
    if (action.multiplier === 0 && action.dmgTypes.every(t => t === 'NEGATIVE_STATUS')) continue
    if (action.castTime <= MIN_CAST_FOR_DPS) continue
    const groupKey = action.groupName ?? action.name
    if (seen.has(action.name)) continue
    seen.add(action.name)

    const { damage, dps } = calcActionDamage(finalStats, action, effectiveEnemyStats)
    const existing = entries.find(e => e.groupKey === groupKey)
    const variant = { action, damage, dps }
    if (existing) {
      existing.variants.push(variant)
      if (dps > existing.bestDps) {
        existing.bestDps = dps
        existing.bestDamage = damage
        existing.topAction = action
      }
    } else {
      entries.push({ groupKey, category: action.category, variants: [variant], bestDps: dps, bestDamage: damage, topAction: action })
    }
  }

  entries.sort((a, b) => b.bestDps - a.bestDps)
  for (const e of entries) e.variants.sort((a, b) => b.dps - a.dps)
  return entries
}
