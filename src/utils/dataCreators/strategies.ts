import type { ExpirationStrategy, TargetingStrategy } from "../../types/buff"
import type { ReductionStrategy } from "../../types/negativeStatus"

// ========== Expiration Strategies ============================================================================================

export function infiniteExpiration(): ExpirationStrategy {
  return { type: "infinite" }
}

export function swapExpiration(swapsRemaining: number): ExpirationStrategy {
  return { type: "swapCount", swapsRemaining }
}

// ========== Targeting Strategies =============================================================================================

export function activeTarget(): TargetingStrategy {
  return { type: "active" }
}

export function allCharactersTarget(): TargetingStrategy {
  return { type: "all" }
}

export function selfTarget(): TargetingStrategy {
  return { type: "self" }
}

export function nextSwapTarget(): TargetingStrategy {
  return { type: "next" }
}

// ========== Reduction Strategies =============================================================================================

export function createReductionStrategy(
  stackConsumption: number,
  triggerDmgOnReduction: boolean,
  resetTimerOnApplication: boolean
): ReductionStrategy {
  return {
    stackConsumption,
    triggerDmgOnReduction,
    resetTimerOnApplication,
  }
}
