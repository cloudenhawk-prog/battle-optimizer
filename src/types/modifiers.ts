import type { CharacterStats, EnemyStats } from "./stats"
import type { StepContext } from "./stepContext"

// ========== Type: Damage Modifier ============================================================================================

export type DamageModifier = {
  characterStats?: {
    add?: Partial<CharacterStats>
    multiply?: Partial<CharacterStats>
  }
  enemyStats?: {
    add?: Partial<EnemyStats>
    multiply?: Partial<EnemyStats>
  }
  condition?: (ctx: StepContext) => number
  source: string
}
