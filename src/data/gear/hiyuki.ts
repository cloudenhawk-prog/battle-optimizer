import type { EchoSetBonus } from '../../types/gear'
import { weaponCatalog, buildWeapon } from './weaponCatalog'
import { buildEcho } from './echoCatalog'

// ========== Weapon ===========================================================================================================
const hiyuki_weapon = buildWeapon(weaponCatalog.find(w => w.name === 'Frostburn')!, 1, 'Hiyuki')! // TODO

// ========== Echoes ===========================================================================================================
const SET = 'Halo of Starry Radiance' // TODO
const SUBS = { critRate: 0.075, critDamage: 0.15, bonusATK: 0.079 } // TODO

const hiyuki_cost_4_echo_1 = buildEcho(SET, 'Reactor Husk',       'critDamage',       0.44, SUBS) // TODO
const hiyuki_cost_3_echo_1 = buildEcho(SET, 'Sabercat Prowler',   'glacioBonusDMG',   0.30, SUBS) // TODO
const hiyuki_cost_3_echo_2 = buildEcho(SET, 'Spacetrek Explorer', 'glacioBonusDMG',   0.30, SUBS) // TODO
const hiyuki_cost_1_echo_1 = buildEcho(SET, 'Geospider S4',       'bonusATK',         0.18, SUBS) // TODO
const hiyuki_cost_1_echo_2 = buildEcho(SET, 'Mining Drone',       'bonusATK',         0.18, SUBS) // TODO

// ========== Set Bonus ========================================================================================================
const hiyuki_set_bonus: EchoSetBonus = { // TODO
  name: 'Some Echo Set name',
  stats: { glacioBonusDMG: 0.10 },
  info: {
    '2-piece': 'Glacio Bonus DMG + 10%.',
    '5-piece': 'Inflicting Glacio Chafe grants 10% Glacio DMG Bonus and \'Snowfall\' Effect: Dealing Resonnance Liberation DMG removes snowfall and increases crit Rate by 25%. Casting Outro Skill removes Snowfall and grants X% glacio DMG bonus to the incoming resonator'
  }, // TODO
  icon: 'assets/gear/set-bonuses/unknown.png' // TODO
}

export {
  // Weapon
  hiyuki_weapon,

  // Echoes
  hiyuki_cost_4_echo_1,
  hiyuki_cost_3_echo_1,
  hiyuki_cost_3_echo_2,
  hiyuki_cost_1_echo_1,
  hiyuki_cost_1_echo_2,

  // Set Bonus
  hiyuki_set_bonus
}