import type { DamageType, ScalingType, ElementType } from './baseTypes'

// ========== Type: Damage Event Calc Params ===================================================================================

/** Closure-based re-evaluator stored on a DamageEvent so DataOverlay can re-evaluate
 *  damage with any subset of modifier groups active (buff toggle feature). */
export type DamageEventCalcParams = {
  reEvaluate: (activeGroupKeys: Set<string>) => { normal: number; crit: number; avg: number }
}

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
  timeStamp: number
  /** Populated at creation time; used by DataOverlay buff-toggle re-evaluation. Non-serializable. */
  calcParams?: DamageEventCalcParams
}

// ========== Type: Contribution ===============================================================================================

export type Contribution = {
  source: string
  /** The character who owns the modifier that produced this contribution.
   *  Null for global/environment modifiers with no specific owner.
   *  Used by the contribution attribution pie in SummaryOverlay. */
  ownerCharacter?: string | null
  displayName?: string
  /** True for inherent modifiers — conditional amplifiers on the action itself, not dispatched buffs. */
  isInherent?: boolean
  /** True when the source modifier has targetStrategy 'self' — treated as base damage in contribution attribution. */
  isSelf?: boolean
  crit_damage_contributed: number
  crit_percent_damage_contributed: number
  normal_damage_contributed: number
  normal_percent_damage_contributed: number
  average_damage_contributed: number
  average_percent_damage_contributed: number
}
