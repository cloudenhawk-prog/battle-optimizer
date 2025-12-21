import type { EnergyGeneration, EnergyCost } from "./energy"
import type { ScalingType, ElementType, DamageType } from "./baseTypes"
import type { Buff, Debuff } from "./buff"
import type { DamageModifier } from "./modifiers"

// ========== Type: Action =====================================================================================================

export type Action = {
  name: string
  castTime: number
  multiplier: number
  scaling: ScalingType
  element: ElementType
  dmgType: DamageType
  cooldown: number

  energyGenerated: EnergyGeneration[]
  energyCost: EnergyCost[]

  negativeStatusesApplied: Record<string, number>
  buffsApplied: Buff[]
  debuffsApplied: Debuff[]

  damageModifiers: DamageModifier[]
}
