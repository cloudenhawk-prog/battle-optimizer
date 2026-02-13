import type { CharacterStats, EnemyStats } from './stats'
import type { StepContext } from './stepContext'

// ========== Type: Damage Modifier ============================================================================================

export type DamageModifier = {
  source: string
  characterStats?: Partial<CharacterStats>
  enemyStats?: Partial<EnemyStats>
  condition?: (ctx: StepContext) => number
}
