import type { Action } from "./character"
import type { NegativeStatusDamageEvent } from "./negativeStatus"

export interface Snapshot {
  id: string
  character?: string
  action?: string
  fromTime: number
  toTime: number
  damage: number
  dps: number
  charactersEnergies: Record<string, Record<string, number>>
  buffs: Record<string, number>
  debuffs: Record<string, number>
  negativeStatuses: Record<string, number>
}

export type DamageEvent = {
  snapshotId: number
  dealer: string
  target: string
  element: Action["element"]
  dmgType: Action["dmgType"]
  scaling: Action["scaling"]
  actionName: string
  normalStrike: number
  criticalStrike: number
  average: number
  negativeStatusDamageEvent?: NegativeStatusDamageEvent
}
