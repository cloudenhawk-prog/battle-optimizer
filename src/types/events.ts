import type { DamageType, ScalingType, ElementType } from "./baseTypes"

// ========== Type: Damage Event ===============================================================================================

export type DamageEvent = {
  snapshotId: number
  dealer: string
  target: string
  elements: ElementType[]
  dmgTypes: DamageType[]
  scaling: ScalingType
  actionName: string
  normalStrike: number
  criticalStrike: number
  average: number
  contributions: Record<string, Contribution>
}

// ========== Type: Negative Status Damage Event ===============================================================================

export type NegativeStatusDamageEvent = {
  name: string,
  element: ElementType
  damage: number
}

// ========== Type: Negative Status Damage Event ===============================================================================
// ========== Type: Negative Status Damage Event ===============================================================================

export type Contribution = {
  crit_damage_contributed: number
  crit_percent_damage_contributed: number
  normal_damage_contributed: number
  normal_percent_damage_contributed: number
  average_damage_contributed: number
  average_percent_damage_contributed: number
}
