import type { Snapshot } from "./snapshot"
import type { Character, Action } from "./character"
import type { Enemy } from "./enemy"
import type { CharacterStats, EnemyStats } from "./stats"
import type { NegativeStatusInAction } from "./negativeStatus"

export type StepLog = {
  resolver: string
  message: string
  details?: any
}

export type StepContext = {
  snapshotId: number
  
  current: Snapshot
  prev: Snapshot

  character: Character
  action: Action
  enemy: Enemy

  fromTime: number
  toTime: number

  // Buffs to be added later
  // Debuffs to be added later

  negativeStatusesInAction: NegativeStatusInAction[]

  characterStats?: CharacterStats
  enemyStats?: EnemyStats

  logs: StepLog[]
}

export type DamageModifier = {
  characterStats?: {
    add?: Partial<CharacterStats>
    multiply?: Partial<CharacterStats>
  }
  enemyStats?: {
    add?: Partial<EnemyStats>
    multiply?: Partial<EnemyStats>
  }
  condition?: (ctx: StepContext) => number
  source: string
}