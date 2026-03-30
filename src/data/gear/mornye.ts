import type { Echo, EchoSetBonus } from '../../types/gear'
import { weaponCatalog, buildWeapon } from './weaponCatalog'

// ========== Weapon ===========================================================================================================
const mornye_weapon = buildWeapon(weaponCatalog.find(w => w.name === 'Starfield Calibrator')!, 1, 'Mornye')!

// ========== Echoes ===========================================================================================================
const mornye_cost_4_echo_1: Echo = {
  name: 'Reactor Husk',
  setName: 'Halo of Starry Radiance',
  cost: 4,
  baseStats: { flatATK: 150, bonusDEF: 0.415 },
  subStats: { energyPercent: 0.084, liberationBonusDMG: 0.079, critDamage: 0.15 },
  firstSlotStats: { energyPercent: 0.10 },
  echoSkill: {
    name: 'Reactor Husk (Active)',
    displayName: 'Reactor Husk (Active)',
    category: 'Echo Skill',
    castTime: 0,
    multiplier: (351) / 100,
    scaling: 'ATK',
    elements: ['FUSION'],
    dmgTypes: ['ECHO'],
    cooldown: 20,
    energyGenerated: [{ energyType: 'energy', amount: 4.87, share: 0.5, scalingStat: 'energyPercent' }],
    energyCost: [],
    statusModifications: [],
    damageModifiers: [],
    sideEffects: [],
    castConditions: {
      startState: 'ANY', // TODO: Need to check
      endState: 'PRESERVE', // TODO: Need to check
      // TODO: Needs to force swapout - we arent interested in normal cast
    },
    offtune: 0
  },
  icon: 'assets/gear/echoes/reactor_husk.png',
  info: 'The Resonator with this Echo equipped in their main slot gain 10.00% Energy Regen.',
  info_icon: 'assets/gear/echoes/info_reactor_husk.png'
}

const mornye_cost_3_echo_1: Echo = {
  name: 'Sabercat Prowler',
  setName: 'Halo of Starry Radiance',
  cost: 3,
  baseStats: { flatATK: 100, energyPercent: 0.32 },
  subStats: { energyPercent: 0.084, liberationBonusDMG: 0.079, critDamage: 0.15 },
  icon: 'assets/gear/echoes/sabercat_prowler.png',
  info_icon: 'assets/gear/echoes/info_sabercat_prowler.png'
}

const mornye_cost_3_echo_2: Echo = {
  name: 'Spacetrek Explorer',
  setName: 'Halo of Starry Radiance',
  cost: 3,
  baseStats: { flatATK: 100, fusionBonusDMG: 0.30 },
  subStats: { energyPercent: 0.084, liberationBonusDMG: 0.079, critDamage: 0.15 },
  icon: 'assets/gear/echoes/spacetrek_explorer.png',
  info_icon: 'assets/gear/echoes/info_spacetrek_explorer.png'
}

const mornye_cost_1_echo_1: Echo = {
  name: 'Geospider S4',
  setName: 'Halo of Starry Radiance',
  cost: 1,
  baseStats: { flatHP: 2280, bonusDEF: 0.18 },
  subStats: { energyPercent: 0.084, liberationBonusDMG: 0.079, critDamage: 0.15 },
  icon: 'assets/gear/echoes/geospider_s4.png',
  info_icon: 'assets/gear/echoes/info_geospider_s4.png'
}

const mornye_cost_1_echo_2: Echo = {
  name: 'Mining Drone',
  setName: 'Halo of Starry Radiance',
  cost: 1,
  baseStats: { flatHP: 2280, bonusDEF: 0.18 },
  subStats: { energyPercent: 0.084, liberationBonusDMG: 0.079, critDamage: 0.15 },
  icon: 'assets/gear/echoes/mining_drone.png',
  info_icon: 'assets/gear/echoes/info_mining_drone.png'
}

// ========== Set Bonus ========================================================================================================
const mornye_set_bonus: EchoSetBonus = {
  name: 'Halo of Starry Radiance',
  stats: { healingBonus: 0.10 },
  info: {
    '2-piece': 'Healing Bonus + 10%.',
    '5-piece': 'When healing a Resonator in the team, every 1% of Off-Tune Buildup Rate grants a 0.2% ATK increase to all Resonators in the team for 4s, up to 25%. Effects of the same name cannot be stacked.'
  },
  icon: 'assets/gear/set-bonuses/halo_of_starry_radiance.png'
}



export {
  // Weapon
  mornye_weapon,

  // Echoes
  mornye_cost_4_echo_1,
  mornye_cost_3_echo_1,
  mornye_cost_3_echo_2,
  mornye_cost_1_echo_1,
  mornye_cost_1_echo_2,

  // Set Bonus
  mornye_set_bonus
}