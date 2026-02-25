import type { CharacterStats, EnemyStats } from './stats'
import type { StepContext } from './stepContext'

// ========== Type: Damage Modifier ============================================================================================

export type DamageModifier = {
  source: string
  displayName: string
  type: 'buff' | 'debuff'
  characterStats?: Partial<CharacterStats>
  enemyStats?: Partial<EnemyStats>
  condition: (ctx: StepContext) => number
  targets: TargetStrategy
  duration: DurationStrategy
  stacking?: StackingStrategy
}

// ========== Type: Target Strategy ============================================================================================

export type TargetStrategy = 'self' | 'active' | 'all' | 'nextSwap'

// ========== Type: Duration Strategy ==========================================================================================

export type DurationStrategy = TimeStrategy | SwapStrategy | PermanentStrategy

export type TimeStrategy = {
  type: 'time-based'
  timeDuration: number
}

export type SwapStrategy = {
  type: 'swap-based'
  numberOfSwaps: number
}

export type PermanentStrategy = {
  type: 'permanent'
}

// ========== Type: Stacking Strategy ==========================================================================================

export type StackingStrategy = {
  maxStacks: number
  resetTimerOnApplication: boolean
  stacksRemovedEachTime: number
}

// TODO :
// Currently the resolvers don't care where modifiers come from - this is perfect
// Currently modifiers come only from: selected character, selected action, active negative statuses - this is perfect

// Add source:
// Gear: Weapon

// We are not ready to update modifiers with:
// TimeStrategy - requires tracking like NegativeStatusesInAction
// SwapStrategy - requires tracking swaps
// PermanentStrategy - might simply relate to timeTracking?

// For contributions, we need a way to distinguish modifiers
// You may not want to see base ones (weapon/character inherent skills)
// You may want to see all actual buffs

// Similarly, we may want to hide certain buffs?
// We may want to go with aggregation: possibly a column for different types of buffs/debuffs, like DurationStrategy, stackingStrategy, Others