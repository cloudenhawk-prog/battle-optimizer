import type { Snapshot } from './snapshot'
import type { Character } from './character'
import type { Action } from './action'
import type { Enemy } from './enemy'
import type { CharacterStats, EnemyStats } from './stats'
import type { NegativeStatusInAction } from './negativeStatus'
import type { DamageModifier, ModifierInAction } from './modifiers'
import type { CoordinatedAttackInAction } from './coordinatedAttack'

// ========== Type: Step Context ===============================================================================================

export type StepContext = {
  snapshotId: number

  current: Snapshot
  prev: Snapshot

  character: Character
  allies: Character[]
  enemy: Enemy

  action: Action

  fromTime: number
  toTime: number

  // Runtime state for active modifiers (similar to negativeStatusesInAction)
  modifiersInAction: ModifierInAction[]
  negativeStatusesInAction: NegativeStatusInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]

  // All permanent modifiers for this step (used for display tracking)
  permanentModifiers: DamageModifier[]

  damageModifiers: DamageModifier[]
  aggregatedCharacterModifiers: Partial<CharacterStats>
  aggregatedEnemyModifiers: Partial<EnemyStats>

  // Track the character who was swapped to most recently (for 'nextSwap' target strategy)
  lastSwappedToCharacter?: string

  logs: StepLog[]
}

// ========== Type: Step Log ===================================================================================================

export type StepLog = {
  resolver: string
  message: string
  details?: any
}
