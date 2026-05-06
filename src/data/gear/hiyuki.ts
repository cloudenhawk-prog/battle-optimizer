import { weaponCatalog, buildWeapon } from './weaponCatalog'
import { buildEcho } from './echoCatalog'

// ========== Weapon ===========================================================================================================
const hiyuki_weapon = buildWeapon(weaponCatalog.find(w => w.name === 'Frostburn')!, 5, 'Hiyuki')!

// ========== Echoes ===========================================================================================================
const SET = 'Wishes of Quiet Snowfall'
const SUBS = { critRate: 0.075, critDamage: 0.15, bonusATK: 0.079 }
const SUBS0 = { critRate: 0.000, critDamage: 0.000, bonusATK: 0.000, liberationBonusDMG: 0.000 }

const SUBS1 = { critRate: 0.063, critDamage: 0.138, bonusATK: 0.079, liberationBonusDMG: 0.071 }
const SUBS2 = { critRate: 0.069, critDamage: 0.21,  bonusATK: 0.101, liberationBonusDMG: 0.094 }
const SUBS3 = { critRate: 0.105, critDamage: 0.15,                   liberationBonusDMG: 0.086 }
const SUBS4 = { critRate: 0.099, critDamage: 0.21,                                             }
const SUBS5 = { critRate: 0.069, critDamage: 0.138,                  liberationBonusDMG: 0.086 }


const hiyuki_cost_4_echo_1 = buildEcho(SET, 'Aleph-1',          'bonusATK',       0.33, SUBS1)
const hiyuki_cost_3_echo_1 = buildEcho(SET, 'Windlash Coleoid', 'bonusATK',       0.30, SUBS2)
const hiyuki_cost_3_echo_2 = buildEcho(SET, 'Tremor Warrior',   'glacioBonusDMG', 0.30, SUBS3)
const hiyuki_cost_1_echo_1 = buildEcho(SET, 'Shadow Stepper',   'bonusATK',       0.18, SUBS4)
const hiyuki_cost_1_echo_2 = buildEcho(SET, 'Iceglint Dancer',  'bonusATK',       0.18, SUBS5)

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