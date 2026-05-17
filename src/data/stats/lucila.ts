import type { CharacterStats } from '../../types/stats'

export const lucila_stats: Partial<CharacterStats> = {
  baseATK: 375,
  baseHP: 12237,
  baseDEF: 1197,
}

export const lucila_inherentStats: Partial<CharacterStats> = {
  critRate: 0.08,  // 8% Crit Rate (inherent skill)
  bonusATK: 0.12, // 12% ATK (inherent skill)
}
