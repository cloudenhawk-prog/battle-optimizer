// Rover (Aero) — base stats (lvl 90) and inherent stat bonuses.
import type { CharacterStats } from '../../types/stats'

export const roverAeroStats: Partial<CharacterStats> = {
  baseATK: 437,
  baseHP: 10775,
  baseDEF: 1136,
}

export const roverAero_inherentStats: Partial<CharacterStats> = {
  bonusATK: 0.12,
}
