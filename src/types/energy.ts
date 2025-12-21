import type { EnergyType } from "./baseTypes"

// ========== Type: Energy Generation ==========================================================================================

export type EnergyGeneration = {
  energyType: EnergyType
  amount: number
  share: number
  scalingStat?: string
}

// ========== Type: Energy Cost ================================================================================================

export type EnergyCost = {
  energyType: EnergyType
  amount: number
}
