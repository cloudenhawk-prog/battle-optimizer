import type { EnergyType } from "./baseTypes"

// ========== Type: Snapshot ===================================================================================================

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
