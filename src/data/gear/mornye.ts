import type { Echo, EchoSetBonus, Weapon } from '../../types/gear'
import { always } from '../../utils/conditions/damageModifierConditions'

// ========== Weapon ===========================================================================================================
const mornye_weapon: Weapon = {
  name: 'Starfield Calibrator',
  stats: { baseATK: 412.50, energyPercent: 0.7704, bonusDEF: 0.16 },
  injectedModifiers: [
    {
      targets: ['character'], // Lieration
      modifiers: [] // TODO: Inject into Liberation action: Casting Resonance Liberation restores 8 points of Concerto Energy (20 second CD) (if liberation has more than 20s cd we dont need to track it)
      // When Mornye heals resonators (only liberation? Or?) Crit DMG of all resontors increaes by 20 % for 4s (max 1 stack, refresh duration on application)
    }
  ],
  rank: 1,
  info: 'Increases DEF by 16%/20%/24%/28%/32%. Casting Resonance Liberation restores 8/10/12/14/16 points of Concerto Energy. This effect can be triggered 1/1/1/1/1 every 20/20/20/20/20s. When the wielder heals Resonators, increases Crit. DMG of all nearby Resonators in the team by 20%/25%/30%/35%/40% for 4/4/4/4/4s. Effects of the same name cannot be stacked.',
  icon: 'assets/gear/weapons/starfield_calibrator.png'
}

// ========== Echoes ===========================================================================================================
const mornye_cost_4_echo_1: Echo = {
  name: 'Reactor Husk',
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
  cost: 3,
  baseStats: { flatATK: 100, energyPercent: 0.32 },
  subStats: { energyPercent: 0.084, liberationBonusDMG: 0.079, critDamage: 0.15 },
  icon: 'assets/gear/echoes/sabercat_prowler.png',
  info_icon: 'assets/gear/echoes/info_sabercat_prowler.png'
}

const mornye_cost_3_echo_2: Echo = {
  name: 'Spacetrek Explorer',
  cost: 3,
  baseStats: { flatATK: 100, fusionBonusDMG: 0.30 },
  subStats: { energyPercent: 0.084, liberationBonusDMG: 0.079, critDamage: 0.15 },
  icon: 'assets/gear/echoes/spacetrek_explorer.png',
  info_icon: 'assets/gear/echoes/info_spacetrek_explorer.png'
}

const mornye_cost_1_echo_1: Echo = {
  name: 'Geospider S4',
  cost: 1,
  baseStats: { flatHP: 2280, bonusDEF: 0.18 },
  subStats: { energyPercent: 0.084, liberationBonusDMG: 0.079, critDamage: 0.15 },
  icon: 'assets/gear/echoes/geospider_s4.png',
  info_icon: 'assets/gear/echoes/info_geospider_s4.png'
}

const mornye_cost_1_echo_2: Echo = {
  name: 'Mining Drone',
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
  injectedModifiers: [
    {
      targets: ['character'],
      modifiers: [] // TODO: Insert 5 piece set effect into character mornye
    }
  ],
  info: {
    '2-piece': 'Healing Bonus + 10%.',
    '5-piece': 'When healing a Resonator in the team, every 1% of Off-Tune Buildup Rate grants a 0.2% ATK increase to all Resonators in the team for 4s, up to 25%. Effects of the same name cannot be stacked.'
  }
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