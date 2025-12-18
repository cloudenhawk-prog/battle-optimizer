import type { DamageModifier } from "./resolver"
import type { Action } from "./character"

type NegativeStatus = {
    name: string
    duration: number
    maxStacksDefault: number,
    frequency: number,
    damage: Record<number, number>,
    element: "AERO" | "SPECTRO" | "HAVOC" | "GLACIO" | "FUSION" | "ELECTRO",
    reductionStrategy: ReductionStrategy,
    damageModifiers: DamageModifier[]
}

type ReductionStrategy = {
    stackConsumption: number,
    triggerDmgOnReduction: boolean,
    resetTimerOnApplication: boolean,
}

type NegativeStatusInAction = {
  negativeStatus: NegativeStatus,
  applicationTime: number,
  timeLeft: number,
  currentStacks: number,
  lastDamageTime: number,
}

type NegativeStatusDamageEvent = {
  name: string,
  element: Action["element"],
  damage: number
}

export type { NegativeStatus, ReductionStrategy, NegativeStatusInAction, NegativeStatusDamageEvent }
