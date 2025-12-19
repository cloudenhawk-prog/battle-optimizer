import type { CharacterStats } from "./stats"
import type { DamageModifier } from "./resolver"

export type Action = {
  name: string
  castTime: number
  multiplier: number
  scaling: "ATK" | "HP" | "DEF"
  element: "AERO" | "SPECTRO" | "HAVOC" | "GLACIO" | "FUSION" | "ELECTRO"
  dmgType: "BASIC" | "HEAVY" | "SKILL" | "LIBERATION" | "COORDINATED" | "ECHO" | "INTRO" | "OUTRO"
  cooldown: number

  energyGenerated: Record<string, number>

  negativeStatusesApplied: Record<string, number>
  buffsApplied: string[]
  debuffsApplied: string[]

  damageModifiers: DamageModifier[]
}

export type Character = {
  name: string
  actions: Action[]
  buffs: string[] // define buffs with damageEffects
  debuffs: string[] // define debuffs with damageEffects
  maxEnergies: Record<string, number>,
  stats: CharacterStats
  damageModifiers: DamageModifier[]
}


export type EnergyType = 'energy' | 'forte' | 'concerto' | 'rage' | 'conviction'

export type EnergyGeneration = {
  energyType: EnergyType
  amount: number
  share: boolean
}