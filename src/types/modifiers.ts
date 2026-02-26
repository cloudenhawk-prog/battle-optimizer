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
// self     - (Done)
// active   - (Done)
//

// ========== Type: Duration Strategy ==========================================================================================

export type DurationStrategy = PermanentStrategy | LimitedStrategy

export type PermanentStrategy = {
  type: 'permanent'
}

export type LimitedStrategy = {
  type: 'limited'
  timeDuration?: number // Expires after N seconds (undefined = no time limit)
  numberOfSwaps?: number // Expires after N swaps (undefined = no swap limit)
}

// ========== Type: Stacking Strategy ==========================================================================================

export type StackingStrategy = {
  maxStacks: number
  resetTimerOnApplication: boolean
  stacksRemovedEachTime: number
}

// ========== Type: Modifier In Action ========================================================================================

/**
 * Runtime state wrapper for DamageModifier, similar to NegativeStatusInAction.
 * Separates the static blueprint (DamageModifier) from the living state during battle.
 */
export type ModifierInAction = {
  modifier: DamageModifier
  applicationTime: number // When the modifier was first applied (in seconds)
  timeLeft: number // Remaining duration in seconds (for time-based duration strategies)
  swapsLeft: number // Remaining swaps before expiration (for swap-based duration strategies)
  currentStacks: number // Current stack count (respects maxStacks from stackingStrategy)
  targetCharacter: string | null // For 'nextSwap' targetStrategy: which character this applies to
}

// TODO :
// Currently the resolvers don't care where modifiers come from - this is perfect
// Currently modifiers come only from: selected character, selected action, active negative statuses - this is perfect

// Add source:
// Gear: Weapon

// ---

// We are now ready to update modifiers with:
// TimeStrategy - requires tracking like NegativeStatusesInAction
// SwapStrategy - requires tracking swaps
// PermanentStrategy - might simply relate to timeTracking?

// For contributions, we need a way to distinguish modifiers
// You may not want to see base ones (weapon/character inherent skills)
// You may want to see all actual buffs

// Similarly, we may want to hide certain buffs?
// We may want to go with aggregation: possibly a column for different types of buffs/debuffs, like DurationStrategy, stackingStrategy, Others
