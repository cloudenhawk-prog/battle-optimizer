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
  /** When true, removing this modifier (timer expiry or explicit stack removal to 0)
   *  clears the ownerCharacter's charactersForteGrants in the snapshot.
   *  Use this on the "anchor" modifier of a forte-grant system (e.g. Cartethyia's Mandate). */
  clearsForteGrantsOnExpiry?: boolean
  /** Groups this modifier under another modifier's contribution entry in DataOverlay.
   *  Set to the source string of the anchor modifier. Grouped modifiers are excluded
   *  together when computing the "damage without" baseline, so their combined effect
   *  is reported as a single contribution. */
  contributionGroup?: string
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
