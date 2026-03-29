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
  healingBonus: number
  tuneBreakBoost: number
  offtuneBuildupRate: number
}

/**
 * Returns default CharacterStats with zeros for additive stats and ones for multipliers.
 * This allows partial stat definitions in character data files.
 */
export function getDefaultCharacterStats(): CharacterStats {
  return {
    level: 90,

    baseATK: 0,
    flatATK: 0,
    bonusATK: 0,
    amplifyATK: 0,
    totalMultiplierATK: 1,

    baseHP: 0,
    flatHP: 0,
    bonusHP: 0,
    amplifyHP: 0,
    totalMultiplierHP: 1,

    baseDEF: 0,
    flatDEF: 0,
    bonusDEF: 0,
    amplifyDEF: 0,
    totalMultiplierDEF: 1,

    critRate: 0.05,
    critDamage: 1.5,

    bonusDMG: 0,
    amplifyDMG: 0,
    totalMultiplierDMG: 1,

    defIgnore: 0,
    elementalResPEN: 0,
    resistancePEN: 0,

    basicBonusDMG: 0,
    basicAmplifyDMG: 0,
    basicTotalMultiplierDMG: 1,
    heavyBonusDMG: 0,
    heavyAmplifyDMG: 0,
    heavyTotalMultiplierDMG: 1,
    skillBonusDMG: 0,
    skillAmplifyDMG: 0,
    skillTotalMultiplierDMG: 1,
    liberationBonusDMG: 0,
    liberationAmplifyDMG: 0,
    liberationTotalMultiplierDMG: 1,
    coordinatedBonusDMG: 0,
    coordinatedAmplifyDMG: 0,
    coordinatedTotalMultiplierDMG: 1,
    echoBonusDMG: 0,
    echoAmplifyDMG: 0,
    echoTotalMultiplierDMG: 1,
    introBonusDMG: 0,
    introAmplifyDMG: 0,
    introTotalMultiplierDMG: 1,
    outroBonusDMG: 0,
    outroAmplifyDMG: 0,
    outroTotalMultiplierDMG: 1,

    aeroErosionBonusDMG: 0,
    aeroErosionAmplifyDMG: 0,
    aeroErosionTotalMultiplierDMG: 1,
    spectroFrazzleBonusDMG: 0,
    spectroFrazzleAmplifyDMG: 0,
    spectroFrazzleTotalMultiplierDMG: 1,
    havocBaneBonusDMG: 0,
    havocBaneAmplifyDMG: 0,
    havocBaneTotalMultiplierDMG: 1,
    glacioChafeBonusDMG: 0,
    glacioChafeAmplifyDMG: 0,
    glacioChafeTotalMultiplierDMG: 1,
    fusionBurstBonusDMG: 0,
    fusionBurstAmplifyDMG: 0,
    fusionBurstTotalMultiplierDMG: 1,
    electroFlareBonusDMG: 0,
    electroFlareAmplifyDMG: 0,
    electroFlareTotalMultiplierDMG: 1,

    spectroBonusDMG: 0,
    spectroAmplifyDMG: 0,
    spectroTotalMultiplierDMG: 1,
    fusionBonusDMG: 0,
    fusionAmplifyDMG: 0,
    fusionTotalMultiplierDMG: 1,
    aeroBonusDMG: 0,
    aeroAmplifyDMG: 0,
    aeroTotalMultiplierDMG: 1,
    glacioBonusDMG: 0,
    glacioAmplifyDMG: 0,
    glacioTotalMultiplierDMG: 1,
    electroBonusDMG: 0,
    electroAmplifyDMG: 0,
    electroTotalMultiplierDMG: 1,
    havocBonusDMG: 0,
    havocAmplifyDMG: 0,
    havocTotalMultiplierDMG: 1,

    energyPercent: 0,
    healingBonus: 0,
    tuneBreakBoost: 0,
    offtuneBuildupRate: 1
  }
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
