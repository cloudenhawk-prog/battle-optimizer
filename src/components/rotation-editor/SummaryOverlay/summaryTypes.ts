// Data shapes produced by the summary computations and consumed by the summary panels
import type { ElementType } from '../../../types/baseTypes'
import type { CharacterStats } from '../../../types/stats'

// ========== Per-Character Summary ===========================================================================================

export type CharacterSummary = {
  name: string
  element: ElementType
  image?: string
  directDamage: number
  caDamage: number
  passiveDamage: number
  /** Direct + CA only (no passive). Used for Pie 1 per-character slice. */
  totalCharacterDamage: number
  damageByType: { type: string; damage: number }[]
  fieldTime: number
  libCount: number
  sequence: 0 | 1 | 2 | 3 | 4 | 5 | 6
  weaponRank: 1 | 2 | 3 | 4 | 5 | null
  weaponName: string | null
}

/** Damage from a dealer that is not a team character (e.g. pooled negative-status ticks), keyed by action name. */
export type GlobalDamageEntry = { name: string; damage: number; element: string }

export type ActionBreakdownEntry = { actionName: string; damage: number; count: number }

// ========== Attribution =====================================================================================================

/** Entry for the contribution-attribution pie (Pie 2). */
export type ContributionEntry = {
  name: string
  element: ElementType | ''
  image?: string
  attributedDamage: number
}

/** How much of one character's own damage comes from themselves vs. each buffing teammate. */
export type ContributionOriginEntry = {
  charName: string
  element: ElementType
  selfPct: number
  buffedBy: { charName: string; element: ElementType; pct: number }[]
}

// ========== Buffs & Energy ==================================================================================================

export type ModifierDisplayInfo = {
  description?: string
  color?: string
  stats?: Partial<CharacterStats>
  showStats?: boolean
  targetStrategy?: string
}

export type BuffUptimeEntry = {
  key: string
  displayName: string
  ownerCharacter: string | null
  ownerElement: ElementType | ''
  coveredDamage: number
  coveragePct: number
  timeUptimePct: number
  firstAppliedAt: number
}

export type EnergyFlowEntry = {
  name: string
  element: ElementType
  libCount: number
  fieldTime: number
  energyGenerated: number
  energyGenPerSecond: number
}
