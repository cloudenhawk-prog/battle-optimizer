import type { CharacterStats } from '../../types/stats'

export const cartethyia_stats: CharacterStats = {
  level: 90,

  baseATK: 724, // TODO each line should document where stats come from - then lookup sequences, echoes, weapon, inherent stats, inherent passives skills
  flatATK: 300,
  bonusATK: 0,
  amplifyATK: 0,
  totalMultiplierATK: 1.0,

  baseHP: 14800,
  flatHP: 6840,
  bonusHP: 2.096,
  amplifyHP: 0,
  totalMultiplierHP: 1.0,

  baseDEF: 611,
  flatDEF: 0,
  bonusDEF: 0,
  amplifyDEF: 0,
  totalMultiplierDEF: 1.0,

  critRate: 0.87,
  critDamage: 2.78,

  bonusDMG: 0,
  amplifyDMG: 0,
  totalMultiplierDMG: 1.0,

  defIgnore: 0.0,
  elementalResPEN: 0.0,
  resistancePEN: 0.0,

  basicBonusDMG: 0,
  basicAmplifyDMG: 0,
  basicTotalMultiplierDMG: 1.0,

  heavyBonusDMG: 0,
  heavyAmplifyDMG: 0,
  heavyTotalMultiplierDMG: 1.0,

  skillBonusDMG: 0,
  skillAmplifyDMG: 0,
  skillTotalMultiplierDMG: 1.0,

  liberationBonusDMG: 0,
  liberationAmplifyDMG: 0,
  liberationTotalMultiplierDMG: 1.0,

  coordinatedBonusDMG: 0,
  coordinatedAmplifyDMG: 0,
  coordinatedTotalMultiplierDMG: 1.0,

  echoBonusDMG: 0,
  echoAmplifyDMG: 0,
  echoTotalMultiplierDMG: 1.0,

  introBonusDMG: 0,
  introAmplifyDMG: 0,
  introTotalMultiplierDMG: 1.0,

  outroBonusDMG: 0,
  outroAmplifyDMG: 0,
  outroTotalMultiplierDMG: 1.0,

  aeroErosionBonusDMG: 0,
  aeroErosionAmplifyDMG: 0,
  aeroErosionTotalMultiplierDMG: 1.0,

  spectroFrazzleBonusDMG: 0,
  spectroFrazzleAmplifyDMG: 0,
  spectroFrazzleTotalMultiplierDMG: 1.0,

  havocBaneBonusDMG: 0,
  havocBaneAmplifyDMG: 0,
  havocBaneTotalMultiplierDMG: 1.0,

  glacioChafeBonusDMG: 0,
  glacioChafeAmplifyDMG: 0,
  glacioChafeTotalMultiplierDMG: 1.0,

  fusionBurstBonusDMG: 0,
  fusionBurstAmplifyDMG: 0,
  fusionBurstTotalMultiplierDMG: 1.0,

  electroFlareBonusDMG: 0,
  electroFlareAmplifyDMG: 0,
  electroFlareTotalMultiplierDMG: 1.0,

  spectroBonusDMG: 0,
  spectroAmplifyDMG: 0,
  spectroTotalMultiplierDMG: 1.0,

  fusionBonusDMG: 0,
  fusionAmplifyDMG: 0,
  fusionTotalMultiplierDMG: 1.0,

  aeroBonusDMG: 0.50,
  aeroAmplifyDMG: 0,
  aeroTotalMultiplierDMG: 1.0,

  glacioBonusDMG: 0,
  glacioAmplifyDMG: 0,
  glacioTotalMultiplierDMG: 1.0,

  electroBonusDMG: 0,
  electroAmplifyDMG: 0,
  electroTotalMultiplierDMG: 1.0,

  havocBonusDMG: 0,
  havocAmplifyDMG: 0,
  havocTotalMultiplierDMG: 1.0,

  energyPercent: 1.1,
}

export const cartethyia_inherentStats: Partial<CharacterStats> = {
  critRate: 0.08,
  bonusHP: 0.12
}