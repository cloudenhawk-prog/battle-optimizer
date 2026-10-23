// Weapon stat labels + value formatting for the rank configure panel

// ========== Stat Labels ======================================================================================================

export const STAT_LABELS: Record<string, string> = {
  baseATK: 'Base ATK',
  bonusATK: 'ATK%',
  bonusHP: 'HP%',
  bonusDEF: 'DEF%',
  flatATK: 'ATK',
  flatHP: 'HP',
  flatDEF: 'DEF',
  critRate: 'Crit Rate',
  critDamage: 'Crit DMG',
  energyPercent: 'Energy Regen',
  healingBonus: 'Healing Bonus',
  aeroBonusDMG: 'Aero DMG',
  spectroBonusDMG: 'Spectro DMG',
  glacioBonusDMG: 'Glacio DMG',
  fusionBonusDMG: 'Fusion DMG',
  electroBonusDMG: 'Electro DMG',
  havocBonusDMG: 'Havoc DMG',
  basicBonusDMG: 'Basic ATK DMG',
  heavyBonusDMG: 'Heavy ATK DMG',
  skillBonusDMG: 'Skill DMG',
  liberationBonusDMG: 'Liberation DMG',
}

// baseATK is a flat number; every other weapon stat is a ratio shown as a percentage
export function formatWeaponStat(key: string, value: number): string {
  return key === 'baseATK' ? Math.round(value).toString() : `${(value * 100).toFixed(1)}%`
}
