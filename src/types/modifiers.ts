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
  negativeStatusEffects?: NegativeStatusEffect[]
  color?: string
}

// ========== Type: Negative Status Effect =====================================================================================

export type NegativeStatusEffectProperty = 'frequency' | 'maxStacks'

export type NegativeStatusEffect = {
  targetStatus: string
  property: NegativeStatusEffectProperty
  value: number // Percentage modifier: -0.5 = -50% frequency (ticks faster), +0.5 = +50% (ticks slower)
}

// ========== Type: Target Strategy ============================================================================================

export type TargetStrategy = 'self' | 'active' | 'all' | 'nextSwap' | 'activeAlly'

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
