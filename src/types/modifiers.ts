import type { CharacterStats, EnemyStats } from "./stats"
import type { StepContext } from "./stepContext"

// ========== Type: Damage Modifier ============================================================================================

export type DamageModifier = {
  source: string;
  effects: StatEffect[]
  condition?: (ctx: StepContext) => number
}

// ========== Type: Internals ==================================================================================================

export type StatTarget = "character" | "enemy"

export type ModifierType = "flat" | "bonus" | "amplify" | "total"

export type StatEffect = {
  type: ModifierType
  target: StatTarget
  stats: Partial<CharacterStats> | Partial<EnemyStats>
}
