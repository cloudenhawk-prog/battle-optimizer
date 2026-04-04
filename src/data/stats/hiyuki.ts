import type { CharacterStats } from '../../types/stats'

export const hiyuki_stats: Partial<CharacterStats> = {
  baseATK: 300,
  baseHP: 1500,
  baseDEF: 500
}

export const hiyuki_inherentStats: Partial<CharacterStats> = {
  critRate: 0.08,
  glacioBonusDMG: 0.16,
}
