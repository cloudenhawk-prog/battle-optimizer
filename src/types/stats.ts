
export type CharacterStats = {
  level: number

  baseATK: number
  flatATK: number
  percentATK: number

  baseHP: number
  flatHP: number
  percentHP: number

  baseDEF: number
  flatDEF: number
  percentDEF: number

  critRate: number
  critDamage: number

  dmgAmplification: number
  defIgnore: number
  resistancePEN: number

  basicDMG: number
  heavyDMG: number
  skillDMG: number
  liberationDMG: number
  coordinatedDMG: number
  echoDMG: number
  introDMG: number
  outroDMG: number

  aeroErosionDMG: number
  spectroFrazzleDMG: number
  havocBaneDMG: number
  glacioChafeDMG: number
  fusionBurstDMG: number
  electroFlareDMG: number

  spectro: number
  fusion: number
  aero: number
  glacio: number
  electro: number
  havoc: number

  energyPercent: number
}

export type EnemyStats = {
  level: number

  aeroRES: number
  spectroRES: number
  havocRES: number
  glacioRES: number
  fusionRES: number
  electroRES: number

  resistance: number
  damageReduction: number
}