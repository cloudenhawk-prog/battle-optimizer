import { weaponCatalog, buildWeapon } from './weaponCatalog'
import { buildEcho } from './echoCatalog'

// ========== Weapon ===========================================================================================================
const hiyuki_weapon = buildWeapon(weaponCatalog.find(w => w.name === 'Frostburn')!, 1, 'Hiyuki')!

// ========== Echoes ===========================================================================================================
const SET = 'Wishes of Quiet Snowfall'
const SUBS = { critRate: 0.075, critDamage: 0.15, bonusATK: 0.079 } // TODO
//const SUBS2 = { critRate: 0.075, critDamage: 0.15, liberationBonusDMG: 0.079 } // TODO

const hiyuki_cost_4_echo_1 = buildEcho(SET, 'Aleph-1',          'bonusATK',     0.30, SUBS)
const hiyuki_cost_3_echo_1 = buildEcho(SET, 'Windlash Coleoid', 'glacioBonusDMG', 0.30, SUBS)
const hiyuki_cost_3_echo_2 = buildEcho(SET, 'Tremor Warrior',   'glacioBonusDMG', 0.30, SUBS)
const hiyuki_cost_1_echo_1 = buildEcho(SET, 'Shadow Stepper',   'bonusATK',       0.18, SUBS)
const hiyuki_cost_1_echo_2 = buildEcho(SET, 'Iceglint Dancer',  'bonusATK',       0.18, SUBS)

// ========== Set Bonus ========================================================================================================

export {
  // Weapon
  hiyuki_weapon,

  // Echoesc
  hiyuki_cost_4_echo_1,
  hiyuki_cost_3_echo_1,
  hiyuki_cost_3_echo_2,
  hiyuki_cost_1_echo_1,
  hiyuki_cost_1_echo_2,
}