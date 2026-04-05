import type { EnergyType } from './baseTypes'

// ========== Type: Energy Generation ==========================================================================================

export type EnergyGeneration = {
  energyType: EnergyType
  amount: number
  share: number
  scalingStat?: string
  /**
   * When set, this energy entry is only granted at most once per `cooldownDuration` seconds.
   * The cooldown is tracked in `charactersCooldowns` under this key.
   * Used for gear effects like "restore X concerto from Liberation, once every 20s".
   */
  cooldownKey?: string
  cooldownDuration?: number
}

// ========== Type: Energy Cost ================================================================================================

export type EnergyCost = {
  energyType: EnergyType
  amount: number
  /** When set, consuming a non-zero amount of this energy type adds these named grants
   *  to the character's charactersForteGrants in the snapshot (deduplicated).
   *  Use this for mechanics where spending a specific forte sub-energy unlocks an effect
   *  (e.g. Cartethyia's sword consumption → Mandate buff variants). */
  grantsOnConsume?: string[]
}
