// ========== Type: Character Stats ============================================================================================

export type CharacterStats = {
  level: number

  baseATK: number
  flatATK: number
  bonusATK: number
  amplifyATK: number
  totalMultiplierATK: number

  baseHP: number
  flatHP: number
  bonusHP: number
  amplifyHP: number
  totalMultiplierHP: number

  baseDEF: number
  flatDEF: number
  bonusDEF: number
  amplifyDEF: number
  totalMultiplierDEF: number

  critRate: number
  critDamage: number

  bonusDMG: number
  amplifyDMG: number
  totalMultiplierDMG: number

  defIgnore: number
  elementalResPEN: number
  resistancePEN: number

  basicBonusDMG: number
  basicAmplifyDMG: number
  basicTotalMultiplierDMG: number
  heavyBonusDMG: number
  heavyAmplifyDMG: number
  heavyTotalMultiplierDMG: number
  skillBonusDMG: number
  skillAmplifyDMG: number
  skillTotalMultiplierDMG: number
  liberationBonusDMG: number
  liberationAmplifyDMG: number
  liberationTotalMultiplierDMG: number
  coordinatedBonusDMG: number
  coordinatedAmplifyDMG: number
  coordinatedTotalMultiplierDMG: number
  echoBonusDMG: number
  echoAmplifyDMG: number
  echoTotalMultiplierDMG: number
  introBonusDMG: number
  introAmplifyDMG: number
  introTotalMultiplierDMG: number
  outroBonusDMG: number
  outroAmplifyDMG: number
  outroTotalMultiplierDMG: number

  aeroErosionBonusDMG: number
  aeroErosionAmplifyDMG: number
  aeroErosionTotalMultiplierDMG: number
  spectroFrazzleBonusDMG: number
  spectroFrazzleAmplifyDMG: number
  spectroFrazzleTotalMultiplierDMG: number
  havocBaneBonusDMG: number
  havocBaneAmplifyDMG: number
  havocBaneTotalMultiplierDMG: number
  glacioChafeBonusDMG: number
  glacioChafeAmplifyDMG: number
  glacioChafeTotalMultiplierDMG: number
  fusionBurstBonusDMG: number
  fusionBurstAmplifyDMG: number
  fusionBurstTotalMultiplierDMG: number
  electroFlareBonusDMG: number
  electroFlareAmplifyDMG: number
  electroFlareTotalMultiplierDMG: number

  spectroBonusDMG: number
  spectroAmplifyDMG: number
  spectroTotalMultiplierDMG: number
  fusionBonusDMG: number
  fusionAmplifyDMG: number
  fusionTotalMultiplierDMG: number
  aeroBonusDMG: number
  aeroAmplifyDMG: number
  aeroTotalMultiplierDMG: number
  glacioBonusDMG: number
  glacioAmplifyDMG: number
  glacioTotalMultiplierDMG: number
  electroBonusDMG: number
  electroAmplifyDMG: number
  electroTotalMultiplierDMG: number
  havocBonusDMG: number
  havocAmplifyDMG: number
  havocTotalMultiplierDMG: number

  energyPercent: number
}

// ========== Type: Enemy Stats ================================================================================================

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
