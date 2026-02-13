import type { EnergyGeneration, EnergyCost } from "./energy"
import type { ScalingType, ElementType, DamageType } from "./baseTypes"
import type { DamageModifier } from "./modifiers"
import type { SideEffect, StatusModification } from "./sideEffect"

// ========== Type: Action =====================================================================================================

export type Action = {
  name: string
  castTime: number
  multiplier: number
  scaling: ScalingType
  elements: ElementType[]
  dmgTypes: DamageType[]
  cooldown: number

  energyGenerated: EnergyGeneration[]
  energyCost: EnergyCost[]

  statusModifications: StatusModification[]

  damageModifiers: DamageModifier[]
  sideEffects: SideEffect[]
}
