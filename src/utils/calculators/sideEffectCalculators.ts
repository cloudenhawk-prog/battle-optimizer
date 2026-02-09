import type { StepContext } from "../../types/stepContext"
import type { DamageEvent } from "../../types/events"
import { calculateDamageNegativeStatus } from "./damageCalculator"

// ========== Aero Erosion Side Effect =========================================================================================

/**
 * Calculates damage based on current Aero Erosion stacks
 * Uses the standard negative status damage formula
 */
export function calculateAeroErosionSideEffectDamage(context: StepContext, sideEffectName: string): DamageEvent {
  const aeroErosionStacks = context.current.negativeStatuses["Aero Erosion"] || 0
  
  if (aeroErosionStacks === 0) {
    // Return a zero-damage event
    return {
      snapshotId: context.snapshotId,
      dealer: `${context.character.name}: ${sideEffectName}`,
      target: context.enemy.name,
      elements: ["AERO"],
      dmgTypes: ["NEGATIVE_STATUS"],
      scaling: "FLAT",
      actionName: sideEffectName,
      normalStrike: 0,
      criticalStrike: 0,
      average: 0,
      contributions: {}
    }
  }

  return calculateDamageNegativeStatus(
    aeroErosionStacks, 
    "AERO", 
    context.enemy, 
    sideEffectName,
    context.character.stats,
    `${context.character.name}: ${sideEffectName}`,
    context.snapshotId
  )
}
