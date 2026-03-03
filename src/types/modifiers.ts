import type { CharacterStats, EnemyStats } from './stats'
import type { StepContext } from './stepContext'

// ========== Type: Damage Modifier ============================================================================================

export type DamageModifier = {
  source: string
  displayName: string
  type: 'buff' | 'debuff'
  ownerCharacter: string | null
  characterStats?: Partial<CharacterStats>
  enemyStats?: Partial<EnemyStats>
  condition: (ctx: StepContext) => number
  targetStrategy: TargetStrategy
  durationStrategy: DurationStrategy
  stackingStrategy: StackingStrategy
}

// ========== Type: Target Strategy ============================================================================================

export type TargetStrategy = 'self' | 'active' | 'all' | 'nextSwap'

// ========== Type: Duration Strategy ==========================================================================================

export type DurationStrategy = PermanentStrategy | LimitedStrategy

export type PermanentStrategy = {
  type: 'permanent'
}

export type LimitedStrategy = {
  type: 'limited'
  timeDuration?: number
  numberOfSwaps?: number
}

// ========== Type: Stacking Strategy ==========================================================================================

export type StackingStrategy = {
  maxStacks: number
  resetTimerOnApplication: boolean
  stacksRemovedEachTime: number
}

// ========== Type: Modifier In Action ========================================================================================

export type ModifierInAction = {
  modifier: DamageModifier
  applicationTime: number
  timeLeft: number
  swapsLeft: number
  currentStacks: number
  targetCharacter: string | null
}
