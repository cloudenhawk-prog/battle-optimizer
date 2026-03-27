import type { Echo, EchoSetBonus, Weapon } from '../../types/gear'
import { always } from '../../utils/conditions/damageModifierConditions'
import { roverAero_liberation, roverAero_midair_1_2, roverAero_midair_1_2_cancel_with_swap, roverAero_skill_3, roverAero_skill_3_cancel_with_swap_1, roverAero_skill_3_cancel_with_swap_2 } from '../actions/roverAero'


// ========== Weapon ===========================================================================================================
const roverAero_weapon: Weapon = {
  name: 'Bloodpact\'s Pledge',
  stats: { baseATK: 587.50, energyPercent: 0.3888 },
  injectedModifiers: [ // TODO: How is this handled? These 2 refer to the same buff, but one allows for a higher timer. Reset should never reset above it's own stated timer, and overlapping names should reference the same buff
    {
      targets: [roverAero_liberation, roverAero_midair_1_2, roverAero_midair_1_2_cancel_with_swap],
      modifiers: [
        {
          source: 'Bloodpact\'s Pledge',
          displayName: 'Harmonious Vibrancy',
          type: 'buff',
          ownerCharacter: 'Rover',
          condition: always(),
          characterStats: { skillBonusDMG: 0.26 },
          targetStrategy: 'self',
          durationStrategy: { type: 'limited', timeDuration: 6 },
          stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
        }
      ]
    },
    {
      targets: [roverAero_skill_3, roverAero_skill_3_cancel_with_swap_1, roverAero_skill_3_cancel_with_swap_2],
      modifiers: [
        {
          source: 'Bloodpact\'s Pledge',
          displayName: 'Harmonious Vibrancy',
          type: 'buff',
          ownerCharacter: 'Rover',
          condition: always(),
          characterStats: { skillBonusDMG: 0.26 },
          targetStrategy: 'self',
          durationStrategy: { type: 'limited', timeDuration: 36 },
          stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
        }
      ]
    }
  ],
  rank: 5,
  info: 'Providing Healing increases Resonance Skill DMG by 10%/14%/18%/22%/26% for 6/6/6/6/6s. When Rover: Aero casts Resonance Skill Unbound Flow, Aero DMG dealt by nearby Resonators on the field is Amplified by 10%/14%/18%/22%/26% for 30/30/30/30/30s.',
  icon: 'assets/gear/weapons/bloodpact\'s_pledge.png'
}

// ========== Echoes ===========================================================================================================
const roverAero_cost_4_echo_1: Echo = {
  name: 'Reminiscence: Fleurdelys',
  cost: 4,
  baseStats: { flatATK: 150, critRate: 0.22 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusHP: 0.079 },
  firstSlotStats: { aeroBonusDMG: 0.10 },
  conditionalStats: {
    condition: (name) => name === 'Cartethyia' || name === 'Rover',
    stats: { aeroBonusDMG: 0.10 },
  },
  echoSkill: {
    name: 'Reminiscence: Fleurdelys (Active)',
    displayName: 'Reminiscence: Fleurdelys (Active)',
    category: 'Echo Skill',
    castTime: 0,
    multiplier: (8 * 27.36 + 136.8) / 100,
    scaling: 'ATK',
    elements: ['AERO'],
    dmgTypes: ['ECHO'],
    cooldown: 20,
    energyGenerated: [{ energyType: 'energy', amount: 8 * 0.38 + 1.9, share: 0.5, scalingStat: 'energyPercent' }],
    energyCost: [],
    statusModifications: [],
    damageModifiers: [],
    sideEffects: [],
    castConditions: {
      startState: 'ANY',
      endState: 'PRESERVE',
    },
    offtune: 0
  },
  icon: 'assets/gear/echoes/reminiscence_fleurdelys.png',
  info: 'The Resonator with this Echo equipped in the main slot gains 10.00% Aero DMG Bonus. When Resonator: Aero Rover or Cartethyia equips this Echo, they gain 10.00% more Aero DMG Bonus.',
  info_icon: 'assets/gear/echoes/info_reminiscence_fleurdelys.png'
}

const roverAero_cost_3_echo_1: Echo = {
  name: 'Capitaneus',
  cost: 3,
  baseStats: { flatATK: 100, aeroBonusDMG: 0.30 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 },
  icon: 'assets/gear/echoes/capitaneus.png',
  info: 'The Resonator with this Echo equipped in their main slot gains 12.00% Spectro DMG Bonus and 12.00% Heavy Attack DMG Bonus.',
  info_icon: 'assets/gear/echoes/info_capitaneus.png'
}

const roverAero_cost_3_echo_2: Echo = {
  name: 'Kerasaur',
  cost: 3,
  baseStats: { flatATK: 100, aeroBonusDMG: 0.30 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 },
  icon: 'assets/gear/echoes/kerasaur.png',
  info: 'The Resonator with this Echo equipped in the main slot gains 12.00% Aero DMG Bonus and 12.00% Resonance Liberation DMG Bonus.',
  info_icon: 'assets/gear/echoes/info_kerasaur.png'
}

const roverAero_cost_1_echo_1: Echo = {
  name: 'Sagittario',
  cost: 1,
  baseStats: { flatHP: 2280, bonusATK: 0.18 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 },
  icon: 'assets/gear/echoes/sacerdos.png',
  info_icon: 'assets/gear/echoes/info_sacerdos.png'
}

const roverAero_cost_1_echo_2: Echo = {
  name: 'Spectro Drake',
  cost: 1,
  baseStats: { flatHP: 2280, bonusATK: 0.18 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 },
  icon: 'assets/gear/echoes/spectro_drake.png',
  info_icon: 'assets/gear/echoes/info_spectro_drake.png'
}

// ========== Set Bonus ========================================================================================================
const roverAero_set_bonus: EchoSetBonus = {
  name: 'Windward Pilgrimage',
  stats: { aeroBonusDMG: 0.10 },
  injectedModifiers: [
    {
      targets: ['character'],
      modifiers: [
        {
          source: 'Cartethyia',
          displayName: 'Windward Pilgrimage (Set Bonus)',
          type: 'buff',
          ownerCharacter: 'Cartethyia',
          characterStats: { aeroBonusDMG: 0.30, critRate: 0.10 },
          condition: always(),
          targetStrategy: 'self',
          durationStrategy: { type: 'permanent' },
          stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 }
        }
      ]
    }
  ],
  info: {
    '2-piece': 'Aero DMG + 10%',
    '5-piece': 'Hitting a target with Aero Erosion increases Crit. Rate by 10% and grants 30% Aero DMG Bonus, lasting for 10s.'
  }
}

export {
  // Weapon
  roverAero_weapon,

  // Echoes
  roverAero_cost_4_echo_1,
  roverAero_cost_3_echo_1,
  roverAero_cost_3_echo_2,
  roverAero_cost_1_echo_1,
  roverAero_cost_1_echo_2,

  // Set Bonus
  roverAero_set_bonus
}