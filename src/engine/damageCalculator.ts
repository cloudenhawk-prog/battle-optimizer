import type { Snapshot, DamageEvent } from "../types/snapshot"
import type { Character, Action } from "../types/character"
import type { Enemy } from "../types/enemy"

type CalculateDamageParams = {
  snapshot: Snapshot      // The current snapshot being calculated
  prev: Snapshot          // The previous snapshot (for buffs, debuffs, energy, etc.)
  action: Action          // The action being performed
  character: Character    // The character performing the action
  enemy: Enemy            // The target enemy
  snapshotId: number      // ID of the snapshot (can also be number if you prefer)
}

type CalculateDamageResult = {
  average: number
  damageEvent: DamageEvent
}


/**
 * For now this calculator does nothing except return the same damage value.
 *
 * In the future this function may receive:
 * - character stats
 * - damage type (Skill, Heavy, Outro, etc)
 * - enemy defense / resistance
 * - buffs, debuffs, modifiers
 * - character level, weapon, echoes…
 * - timeline context
 * and produce the final damage number.
 */
export function calculateDamage(params: CalculateDamageParams): CalculateDamageResult {
  const { snapshot, prev, action, character, enemy, snapshotId } = params
  // TODO: based on prev snapshot, apply buffs, debuffs that can affect dmg
  // TODO: calculate negative status damage and create another damageEvent?

  const stats = character.stats
  const scalingStat = action.scaling
  const dmgType = action.dmgType
  const element = action.element

  const enemyStats = enemy.stats

  const actionMultiplier = action.multiplier

  // Character Stats
  const level             = stats.level
  const scalingStatVal    = stats[`base${scalingStat}`] * (1 + stats[`percent${scalingStat}`]) + stats[`flat${scalingStat}`]
  const critRate          = stats.critRate
  const critDamage        = stats.critDamage
  const dmgAmplification  = stats.dmgAmplification
  const defIgnore         = stats.defIgnore
  const elementalResPEN   = stats.elementalResPEN
  const resistancePEN     = stats.resistancePEN
  const dmgTypeVal        = stats[`${dmgType.toLowerCase()}DMG` as keyof typeof stats]
  const elementVal        = stats[element.toLowerCase() as keyof typeof stats]

  // Enemy Stats
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

  const elementalDmgMultiplier = 1 + elementVal
  const dmgTypeMultiplier = 1 + dmgTypeVal
  const dmgAmplificationMultiplier = 1 + dmgAmplification
  const bonusDMG = elementalDmgMultiplier * dmgTypeMultiplier * dmgAmplificationMultiplier

  const critBonusDMG = 1 + critRate * (critDamage - 1)

  const normalStrike    = actionMultiplier * baseDMG * damageRES * bonusDMG
  const criticalStrike  = actionMultiplier * baseDMG * damageRES * bonusDMG * critDamage
  const average         = actionMultiplier * baseDMG * damageRES * bonusDMG * critBonusDMG

  const damageEvent = {
    snapshotId,
    dealer: character.name,
    target: enemy.name,
    element,
    dmgType,
    scaling: scalingStat,
    actionName: action.name,
    normalStrike,
    criticalStrike,
    average
  }

  // console.log(
  //   "Snapshot ID:", snapshotId,
  //   "\nSnapshot:", snapshot,
  //   "\nAction:", action,
  //   "\nCharacter:", character,
  //   "\nEnemy:", enemy,
  //   "\nStats:", stats,
  //   "\nScaling Stat:", scalingStat,
  //   "\nDMG Type:", dmgType,
  //   "\nElement:", element,
  //   "\nEnemy Stats:", enemyStats,
  //   "\nAction Multiplier:", actionMultiplier,
  //   "\nLevel:", level,
  //   "\nScaling Stat Value:", scalingStatVal,
  //   "\nCrit Rate:", critRate,
  //   "\nCrit Damage:", critDamage,
  //   "\nDamage Amplification:", dmgAmplification,
  //   "\nDef Ignore:", defIgnore,
  //   "\nElemental Res PEN:", elementalResPEN,
  //   "\nResistance PEN:", resistancePEN,
  //   "\nDMG Type Value:", dmgTypeVal,
  //   "\nElement Value:", elementVal,
  //   "\nEnemy Level:", enLevel,
  //   "\nEnemy Element RES:", enElementRES,
  //   "\nEnemy Resistance:", enResistance,
  //   "\nEnemy Damage Reduction:", enDamageReduction,
  //   "\nEnemy Defense:", enDefense,
  //   "\nBase DMG:", baseDMG,
  //   "\nRes Multiplier:", resMultiplier,
  //   "\nDefense Multiplier:", defenseMultiplier,
  //   "\nDamage Reduction Multiplier:", damageReductionMultiplier,
  //   "\nElemental Res Multiplier:", elementalResMultiplier,
  //   "\nDamage RES:", damageRES,
  //   "\nElemental DMG Multiplier:", elementalDmgMultiplier,
  //   "\nDMG Type Multiplier:", dmgTypeMultiplier,
  //   "\nDMG Amplification Multiplier:", dmgAmplificationMultiplier,
  //   "\nBonus DMG:", bonusDMG,
  //   "\nCrit Bonus DMG:", critBonusDMG,
  //   "\nNormal Strike:", normalStrike,
  //   "\nCritical Strike:", criticalStrike,
  //   "\nAverage Damage:", average,
  //   "\nDamage Event:", damageEvent
  // )

  return { average, damageEvent }
}

export function calculateDamageNegativeStatus(currStacks: number, element: string, enemy: Enemy): number {
  



  return currStacks * 5
}

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

// When a damage calculator returns damage dealt, the value should be logged: Character / Damage Type / Element / Source / timestamp
// ... so that we can do statistics, show graphic timeline with "action icons"
// For negative statuses, it's harder to associate it with a character - might be best to put it as "null" or some default value
