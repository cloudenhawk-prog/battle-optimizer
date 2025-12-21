import type { DamageEvent } from "../../types/events"
import type { Action } from "../../types/action"
import type { Enemy } from "../../types/enemy"
import type { CharacterStats } from "../../types/stats"
import { negativeStatuses } from "../../data/negativeStatuses"

// ========== Base Calculator ==================================================================================================

type CalculateDamageParams = {
  action: Action
  name: string
  stats: CharacterStats
  enemy: Enemy
  snapshotId: number
}

type CalculateDamageResult = {
  average: number
  damageEvent: DamageEvent
}

export function calculateDamage({ action, name, stats, enemy, snapshotId }: CalculateDamageParams): CalculateDamageResult {
  // Scaling Definition
  const scalingStat = action.scaling
  const dmgType = action.dmgType
  const element = action.element
  const actionMultiplier = action.multiplier

  // Character Stats
  const level             = stats.level
  const scalingStatVal    = stats[`base${scalingStat}`] * stats[`percent${scalingStat}`] + stats[`flat${scalingStat}`]
  const critRate          = stats.critRate
  const critDamage        = stats.critDamage
  const dmgAmplification  = stats.dmgAmplification
  const defIgnore         = stats.defIgnore
  const elementalResPEN   = stats.elementalResPEN
  const resistancePEN     = stats.resistancePEN
  const dmgTypeVal        = stats[`${dmgType.toLowerCase()}DMG` as keyof typeof stats]
  const elementVal        = stats[element.toLowerCase() as keyof typeof stats]

  // Enemy Stats
  const enemyStats = enemy.stats
  const enLevel = enemyStats.level
  const enElementRES = enemyStats[`${element.toLowerCase()}RES` as keyof typeof enemyStats]
  const enResistance = enemyStats.resistance
  const enDamageReduction = enemyStats.damageReduction
  const enDefense = convertLevelToDefense(enLevel)

  // Damage Calculations
  const baseDMG =  scalingStatVal

  const resMultiplier = getResMultiplier(resistancePEN, enResistance)
  const defenseMultiplier = getDefenseMultiplier(level, enDefense, defIgnore)
  const damageReductionMultiplier = 1 - enDamageReduction
  const elementalResMultiplier = 1 - (enElementRES - elementalResPEN)
  const damageRES = resMultiplier * defenseMultiplier * damageReductionMultiplier * elementalResMultiplier

  const elementalDmgMultiplier = elementVal
  const dmgTypeMultiplier = dmgTypeVal
  const dmgAmplificationMultiplier = dmgAmplification
  const bonusDMG = elementalDmgMultiplier * dmgTypeMultiplier * dmgAmplificationMultiplier

  const critBonusDMG = 1 + critRate * (critDamage - 1)

  const normalStrike    = actionMultiplier * baseDMG * damageRES * bonusDMG
  const criticalStrike  = actionMultiplier * baseDMG * damageRES * bonusDMG * critDamage
  const average         = actionMultiplier * baseDMG * damageRES * bonusDMG * critBonusDMG

  const damageEvent: DamageEvent = {
    snapshotId,
    dealer: name,
    target: enemy.name,
    element,
    dmgType,
    scaling: scalingStat,
    actionName: action.name,
    normalStrike,
    criticalStrike,
    average
  }

  return { average, damageEvent }
}

// ========== Negative Status Calculator =======================================================================================

export function calculateDamageNegativeStatus(currStacks: number, element: string, enemy: Enemy, name: string): number {
  const statusIdentifier = Object.entries(negativeStatuses).find(([key, status]) => status.name === name)?.[0]

  // Enemy Stats
  const enemyStats = enemy.stats
  const level = enemyStats.level
  const defense = convertLevelToDefense(level)
  const res = enemyStats.resistance
  const elementRES = enemyStats[`${element.toLowerCase()}RES` as keyof typeof enemyStats]
  const damageReduction = enemyStats.damageReduction

  // Damage Calculations
  const baseDMG = negativeStatuses[statusIdentifier].damage[currStacks]

  const resMultiplier = getResMultiplier(0, res)
  const defenseMultiplier = getDefenseMultiplier(level, defense, 0)
  const damageReductionMultiplier = 1 - damageReduction
  const elementalResMultiplier = 1 - (elementRES - 0)
  const damageRES = resMultiplier * defenseMultiplier * damageReductionMultiplier * elementalResMultiplier

  const damage = baseDMG * damageRES

  return damage
}

// ========== Helper Functions =================================================================================================

function getResMultiplier(resistancePEN: number, resistance: number): number {
  const resDiff = resistance - resistancePEN
  if (resDiff < 0) return 1 - resDiff / 2
  if (resDiff < 0.8) return 1 - resDiff
  return 1 / (1 + 5 * resDiff)
}

function convertLevelToDefense(enLevel: number): number {
  return 8 * enLevel + 792
}

function getDefenseMultiplier(level: number, defense: number, defIgnore: number) {
  return (800 + 8 * level) / (800 + 8 * level  + defense  * (1 - defIgnore))
}
