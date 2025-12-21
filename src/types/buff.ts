import type { DamageModifier } from "./modifiers"

// ========== Type: Buff =======================================================================================================

export type Buff = {
  name: string
  duration: number
  damageModifiers: DamageModifier[]
  expirationStrategy: ExpirationStrategy
  targetingStrategy: TargetingStrategy
  source: string
}

// ========== Type: Debuff =====================================================================================================

export type Debuff = {
  name: string
  duration: number
  damageModifiers: DamageModifier[]
  // TODO add more types here if needed (like: target: enemy stats)
}

// ========== Type: Expiration Strategy ========================================================================================

export type ExpirationStrategy = InfiniteExpiration | SwapExpiration

export type InfiniteExpiration = {
  type: "infinite"
}

export type SwapExpiration = {
  type: "swapCount"
  swapsRemaining: number
}

// ========== Type: Targeting Strategy =========================================================================================

export type TargetingStrategy = ActiveTarget | AllCharactersTarget | SelfTarget | NextSwapTarget

type ActiveTarget = {
  type: "active"
}

type AllCharactersTarget = {
  type: "all"
}

type SelfTarget = {
  type: "self"
}

type NextSwapTarget = {
  type: "next"
}
