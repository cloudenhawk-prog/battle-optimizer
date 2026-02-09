import type { StepContext } from "./stepContext"
import type { EnergyGeneration } from "./energy"
import type { DamageEvent } from "./events"

// ========== Type: SideEffect =================================================================================================

export type SideEffect = {
  name: string
  damageDealt: (context: StepContext, sideEffectName: string) => DamageEvent
  energyGenerated: EnergyGeneration[]
  statusModifications: StatusModification[]
}

// ========== Type: StatusModification =========================================================================================

export type StatusModification = {
  type: "buff" | "debuff" | "negativeStatus"
  targetName: string
  stackChange?: number
  durationChange?: number
  refreshDuration?: boolean
}
