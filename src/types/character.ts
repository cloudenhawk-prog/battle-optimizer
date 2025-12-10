import type { CharacterStats } from "./stats"

export type Action = {
  name: string
  castTime: number
  multiplier: number
  scaling: "ATK" | "HP" | "DEF"
  element: "AERO" | "SPECTRO" | "HAVOC" | "GLACIO" | "FUSION" | "ELECTRO"
  dmgType: "BASIC" | "HEAVY" | "SKILL" | "LIBERATION" | "COORDINATED" | "ECHO" | "INTRO" | "OUTRO"
  cooldown: number

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
