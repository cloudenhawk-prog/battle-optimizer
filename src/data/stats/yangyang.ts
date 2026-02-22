import type { CharacterStats } from '../../types/stats'

// ========== Stats ===========================================================================================================

export const baseStats: Partial<CharacterStats> = { // TODO: make sure partial stats are handled
  level: 90,

  baseATK: 250,
  baseHP: 10200,
  baseDEF: 1099,

  critRate: 0.05,
  critDamage: 1.50,

  energyPercent: 1.0
}

export const inherentStats: Partial<CharacterStats> = {
  bonusATK: 0.12,
  aeroBonusDMG: 0.12
}
