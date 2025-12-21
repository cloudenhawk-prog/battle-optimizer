import type { Snapshot } from "./snapshot"
import type { Character } from "./character"
import type { Action } from "./action"
import type { Enemy } from "./enemy"
import type { CharacterStats, EnemyStats } from "./stats"
import type { NegativeStatusInAction } from "./negativeStatus"

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

  // Buffs to be added later
  // Debuffs to be added later

  negativeStatusesInAction: NegativeStatusInAction[]

  characterStats?: CharacterStats
  enemyStats?: EnemyStats

  logs: StepLog[]
}

// ========== Type: Step Log ===================================================================================================

export type StepLog = {
  resolver: string
  message: string
  details?: any
}
