import type { CharacterStats } from "./stats"
import type { DamageModifier } from "./modifiers"
import type { Action } from "./action"
import type { EnergyType } from "./baseTypes"

// ========== Type: Character ==================================================================================================

export type Character = {
  name: string
  actions: Action[]
  maxEnergies: Partial<Record<EnergyType, number>>;
  stats: CharacterStats
  damageModifiers: DamageModifier[]
}
