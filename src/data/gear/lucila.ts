// Lucila's default gear: Freeze Frame R1 and a Wishes of Quiet Snowfall echo set built from the catalogs.
import { weaponCatalog, buildWeapon } from './weaponCatalog'
import { buildEcho } from './echoCatalog'

// ========== Weapon ===========================================================================================================
export const lucila_weapon = buildWeapon(weaponCatalog.find(w => w.name === 'Freeze Frame')!, 1, 'Lucila')!

// ========== Echoes ===========================================================================================================
const SET = 'Wishes of Quiet Snowfall'

const SUBS1 = { critRate: 0.063, critDamage: 0.138, bonusATK: 0.079, energyPercent: 0.071 }
const SUBS2 = { critRate: 0.069, critDamage: 0.21,  bonusATK: 0.101, energyPercent: 0.071 }
const SUBS3 = { critRate: 0.105, critDamage: 0.15,  bonusATK: 0.079                       }
const SUBS4 = { critRate: 0.099, critDamage: 0.21,  energyPercent: 0.071 }
const SUBS5 = { critRate: 0.069, critDamage: 0.21,  energyPercent: 0.071 }

export const lucila_echo_main    = buildEcho(SET, 'Glommoth',         'glacioBonusDMG', 0.30, SUBS1)
// NOTE: 4-cost Crit DMG main stat is 0.44 in MAIN_STAT_OPTIONS; 0.33 here looks like a typo.
export const lucila_echo_4cost   = buildEcho(SET, 'Aleph-1',          'critDamage',     0.33, SUBS2)
export const lucila_echo_3cost   = buildEcho(SET, 'Windlash Coleoid', 'glacioBonusDMG', 0.30, SUBS3)
export const lucila_echo_1cost_a = buildEcho(SET, 'Shadow Stepper',   'bonusATK',       0.18, SUBS4)
export const lucila_echo_1cost_b = buildEcho(SET, 'Iceglint Dancer',  'bonusATK',       0.18, SUBS5)
