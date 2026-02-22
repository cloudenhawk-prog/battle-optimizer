import type { CharacterStats } from '../../types/stats'

// ========== Stats ===========================================================================================================

export const baseStats: Partial<CharacterStats> = {
  level: 90,

  baseATK: 312,
  baseHP: 14800,
  baseDEF: 611,

  critRate: 0.05,
  critDamage: 1.50,

  energyPercent: 1.0
}

export const inherentStats: Partial<CharacterStats> = {
  // TODO
}

// Must:  Shorekeeper, Ciaconna, Rover Aero, Chisa, Mornye

// Maybe: Sanhua, Jinhsi, Verina, Carlotta, Ciaconna, Buling, 