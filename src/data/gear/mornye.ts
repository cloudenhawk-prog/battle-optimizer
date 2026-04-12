import { weaponCatalog, buildWeapon } from './weaponCatalog'
import { buildEcho } from './echoCatalog'

// ========== Weapon ===========================================================================================================
const mornye_weapon = buildWeapon(weaponCatalog.find(w => w.name === 'Starfield Calibrator')!, 1, 'Mornye')!

// ========== Echoes ===========================================================================================================
const SET = 'Halo of Starry Radiance'
const SUBS = { energyPercent: 0.084, liberationBonusDMG: 0.079, critDamage: 0.15 }

const mornye_cost_4_echo_1 = buildEcho(SET, 'Reactor Husk',      'bonusDEF',       0.415, SUBS)
const mornye_cost_3_echo_1 = buildEcho(SET, 'Sabercat Prowler',  'energyPercent',  0.32,  SUBS)
const mornye_cost_3_echo_2 = buildEcho(SET, 'Spacetrek Explorer','fusionBonusDMG', 0.30,  SUBS)
const mornye_cost_1_echo_1 = buildEcho(SET, 'Geospider S4',      'bonusDEF',       0.18,  SUBS)
const mornye_cost_1_echo_2 = buildEcho(SET, 'Mining Drone',      'bonusDEF',       0.18,  SUBS)

// ========== Set Bonus ========================================================================================================

export {
  // Weapon
  mornye_weapon,

  // Echoes
  mornye_cost_4_echo_1,
  mornye_cost_3_echo_1,
  mornye_cost_3_echo_2,
  mornye_cost_1_echo_1,
  mornye_cost_1_echo_2,
}
