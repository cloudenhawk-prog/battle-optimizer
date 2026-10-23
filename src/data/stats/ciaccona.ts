// Ciaccona — base stats (lvl 90) and inherent stat bonuses.
import type { CharacterStats } from '../../types/stats'

export const ciaccona_stats: Partial<CharacterStats> = {
  baseATK: 375,
  baseHP: 12237,
  baseDEF: 1197,
}

export const ciaccona_inherentStats: Partial<CharacterStats> = {
  critDamage: 0.16,
  bonusATK: 0.12,
}
