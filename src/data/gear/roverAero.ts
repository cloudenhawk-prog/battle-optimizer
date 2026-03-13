import type { Echo, EchoSetBonus, Weapon } from '../../types/gear'
import { always } from '../../utils/conditions/damageModifierConditions'
import { roverAero_liberation, roverAero_midair_1_2, roverAero_midair_1_2_cancel_with_swap, roverAero_skill_3, roverAero_skill_3_cancel_with_swap_1, roverAero_skill_3_cancel_with_swap_2 } from '../actions/roverAero'


// ========== Weapon ===========================================================================================================
const roverAero_weapon: Weapon = {
  name: 'Static Mist',
  stats: { flatATK: 587.50, energyPercent: 0.3888 },
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
  ]
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
    category: 'Other',
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
  }
}

const roverAero_cost_3_echo_1: Echo = {
  name: 'Capitaneus',
  cost: 3,
  baseStats: { flatATK: 100, aeroBonusDMG: 0.30 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 }
}

const roverAero_cost_3_echo_2: Echo = {
  name: 'Capitaneus',
  cost: 3,
  baseStats: { flatATK: 100, aeroBonusDMG: 0.30 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 }
}

const roverAero_cost_1_echo_1: Echo = {
  name: 'Sagittario',
  cost: 1,
  baseStats: { flatHP: 2280, bonusATK: 0.18 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 }
}

const roverAero_cost_1_echo_2: Echo = {
  name: 'Sacerdos',
  cost: 1,
  baseStats: { flatHP: 2280, bonusATK: 0.18 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 }
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
  ]
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