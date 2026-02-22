import type { DamageType, ElementType, Position, ScalingType } from "../../types/baseTypes"
import type { EnergyCost, EnergyGeneration } from "../../types/energy"
import type { DamageModifier } from "../../types/modifiers"
import type { SideEffect, StatusModification } from "../../types/sideEffect"

type CastConditions = {
  position: Position
  previousAction: string
  endState: Position
}

type Other = {
  hardness: number[]
  toughness: number[]
  offtune: number[]
}

export type Action = {
  name: string
  displayName: string
  castTime: number
  multipliers: number[]
  scaling: ScalingType
  elements: ElementType[]
  dmgTypes: DamageType[]
  cooldown: number

  castConditions: CastConditions

  energiesGenerated: EnergyGeneration[][]
  energiesCost: EnergyCost[]

  statusModifications: StatusModification[]
  damageModifiers: DamageModifier[]
  sideEffects: SideEffect[]

  other: Other
}

// ========== Basic ===========================================================================================================


// ========== Forte ===========================================================================================================

// ========== Skill ===========================================================================================================


// ========== Liberation ======================================================================================================


// ========== Intro & Outro ===================================================================================================
