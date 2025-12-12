
type NegativeStatus = {
    name: string
    duration: number
    maxStacksDefault: number,
    frequency: number,
    damage: Record<number, number>,
    element: "AERO" | "SPECTRO" | "HAVOC" | "GLACIO" | "FUSION" | "ELECTRO",
    reductionStrategy: ReductionStrategy
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

export type { NegativeStatus, ReductionStrategy, NegativeStatusInAction }
