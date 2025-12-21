import type { DamageModifier } from "./modifiers"
import type { ElementType } from "./baseTypes"

// ========== Type: Negative Status ============================================================================================

export type NegativeStatus = {
    name: string
    duration: number
    maxStacksDefault: number,
    frequency: number,
    damage: Record<number, number>,
    element: ElementType,
    reductionStrategy: ReductionStrategy,
    damageModifiers: DamageModifier[]
}

// ========== Type: Negative Status In Action ==================================================================================

export type NegativeStatusInAction = {
  negativeStatus: NegativeStatus,
  applicationTime: number,
  timeLeft: number,
  currentStacks: number,
  lastDamageTime: number,
}

// ========== Type: Reduction Strategy =========================================================================================

export type ReductionStrategy = {
    stackConsumption: number,
    triggerDmgOnReduction: boolean,
    resetTimerOnApplication: boolean,
}
