import type { Action } from "./character"
import type { EnergyType } from "./character"

export interface Snapshot {
  id: string
  character?: string
  action?: string
  fromTime: number
  toTime: number
  damage: number
  dps: number
  charactersEnergies: Partial<Record<EnergyType, number>>
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
}
