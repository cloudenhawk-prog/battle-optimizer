import type { CharacterStats, EnemyStats } from './stats'
import type { StepContext } from './stepContext'

// ========== Type: Damage Modifier ============================================================================================

export type DamageModifier = {
  source: string
  displayName?: string // Optional display name for UI purposes
  characterStats?: Partial<CharacterStats>
  enemyStats?: Partial<EnemyStats>
  condition?: (ctx: StepContext) => number
}
