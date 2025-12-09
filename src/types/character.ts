import type { CharacterStats } from "./stats"

export type Action = {
  name: string
  time: number
  damage: number
  energyGenerated: Record<string, number>

  negativeStatusesApplied: string[]
  buffsApplied: string[]
  debuffsApplied: string[]
}

export type Character = {
  name: string
  actions: Action[]
  negativeStatuses: string[]
  buffs: string[]
  debuffs: string[]
  maxEnergies: Record<string, number>,
  stats: CharacterStats
}
