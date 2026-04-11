import type { Snapshot } from './snapshot'
import type { ResolvedCharacter } from './character'
import type { Action } from './action'
import type { Enemy } from './enemy'
import type { CharacterStats, EnemyStats } from './stats'
import type { NegativeStatusInAction } from './negativeStatus'
import type { DamageModifier, ModifierInAction } from './modifiers'
import type { CoordinatedAttackInAction } from './coordinatedAttack'
import type { DamageEvent } from './events'

// ========== Type: Step Context ===============================================================================================

export type StepContext = {
  snapshotId: number

  current: Snapshot
  prev: Snapshot

  character: ResolvedCharacter
  allies: ResolvedCharacter[]
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

  // Accumulated damage events produced during this step (replaces React Dispatch wiring)
  damageEvents: DamageEvent[]

  // Track the character who was swapped to most recently (for 'nextSwap' target strategy)
  lastSwappedToCharacter?: string

  /**
   * Energy cooldowns queued by resolveResources to be applied after resolveCooldowns
   * rebuilds charactersCooldowns from prev. Each entry registers a cooldown key so the
   * energy won't fire again until the timer expires.
   */
  pendingEnergyCooldowns: Array<{ charName: string; cooldownKey: string; cooldownDuration: number }>

  logs: StepLog[]
}

// ========== Type: Step Log ===================================================================================================

export type StepLog = {
  resolver: string
  message: string
  details?: any
}
