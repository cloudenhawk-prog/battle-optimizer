import type { DamageType, ScalingType, ElementType } from "./baseTypes"

// ========== Type: Damage Event ===============================================================================================

export type DamageEvent = {
  snapshotId: number
  dealer: string
  target: string
  element: ElementType
  dmgType: DamageType
  scaling: ScalingType
  actionName: string
  normalStrike: number
  criticalStrike: number
  average: number
}

// ========== Type: Negative Status Damage Event ===============================================================================

export type NegativeStatusDamageEvent = {
  name: string,
  element: ElementType
  damage: number
}
