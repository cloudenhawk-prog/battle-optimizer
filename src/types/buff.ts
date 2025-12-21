import type { DamageModifier } from "./modifiers"

// ========== Type: Buff =======================================================================================================

export type Buff = {
  name: string
  duration: number
  damageModifiers: DamageModifier[]
}

// ========== Type: Debuff =====================================================================================================

export type Debuff = {
  name: string
  duration: number
  damageModifiers: DamageModifier[]
}
