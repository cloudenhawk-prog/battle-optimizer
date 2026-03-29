import type { Echo, EchoSetBonus, Weapon } from '../../types/gear'
import { always, atLeastOneStackOf } from '../../utils/conditions/damageModifierConditions'

// ========== Weapon ===========================================================================================================
const cartethyia_weapon: Weapon = {
  name: 'Defier\'s Thorn',
  stats: { baseATK: 412.50, bonusHP: 0.7223 + 0.12 },
  injectedModifiers: [
    {
      targets: ['character'],
      modifiers: [
        {
          source: "Defier's Thorn", displayName: 'A Free Knight\'s Tarantella (1)', type: 'buff', ownerCharacter: 'Cartethyia', condition: always(), characterStats: { defIgnore: 0.08 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 }
        },
        {
          source: "Defier's Thorn", displayName: 'A Free Knight\'s Tarantella (2)', type: 'buff', ownerCharacter: 'Cartethyia', condition: atLeastOneStackOf('Aero Erosion'), characterStats: { amplifyDMG: 0.2 }, targetStrategy: 'self', durationStrategy: { type: 'permanent' }, stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 }
        }
      ]
    }
  ],
  rank: 1,
  info: 'Max HP is increased by 12%/15%/18%/21%/24%. 15/15/15/15/15s after casting Intro Skill or Basic Attacks, ignore 8%/10%/12%/14%/16% of the target\'s DEF when dealing damage. If the target has at least 1 stack of Aero Erosion, the DMG taken by the target is Amplified by 20%/25%/30%/35%/40%.',
  icon: 'assets/gear/weapons/defier\'s_thorn.png'
}

// ========== Echoes ===========================================================================================================
const cartethyia_cost_4_echo_1: Echo = {
  name: 'Reminiscence: Fleurdelys',
  cost: 4,
  baseStats: { flatATK: 150, critDamage: 0.44 },
  subStats: { critRate: 0.099, critDamage: 0.174, bonusHP: 0.086, bonusDEF: 0.100, flatHP: 470 },
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

const cartethyia_cost_4_echo_2: Echo = {
  name: 'Nightmare: Kelpie', // TODO - copy Ciaccona's - shouldnt matter since only 1st slot echoes get firstSlotStats and inject sideEffects/modifiers (MAKE SURE)
  cost: 4,
  baseStats: { flatATK: 150, critRate: 0.22 },
  subStats: { bonusHP: 0.101, critRate: 0.075, skillBonusDMG: 0.094, energyPercent: 0.076, basicBonusDMG: 0.101 },
  icon: 'assets/gear/echoes/nightmare_kelpie.png',
  info: 'The Resonator with this Echo equipped in the main slot gains 12.00% Glacio DMG Bonus and 12.00% Aero DMG Bonus. Switching out the Resonator with Outro Skill summons Nightmare: Kelpie to deal 405.00% Aero DMG.',
  info_icon: 'assets/gear/echoes/info_nightmare_kelpie.png'
}

const cartethyia_cost_1_echo_1: Echo = {
  name: 'Spectro Drake',
  cost: 1,
  baseStats: { flatHP: 2280, bonusHP: 0.228 },
  subStats: { critDamage: 0.126, energyPercent: 0.084, critRate: 0.081, flatATK: 50, bonusHP: 0.094 },
  icon: 'assets/gear/echoes/spectro_drake.png',
  info_icon: 'assets/gear/echoes/info_spectro_drake.png'
}

const cartethyia_cost_1_echo_2: Echo = {
  name: 'Sacerdos',
  cost: 1,
  baseStats: { flatHP: 2280, bonusHP: 0.228 },
  subStats: { bonusHP: 0.064, critRate: 0.063, critDamage: 0.126, bonusDEF: 0.109, basicBonusDMG: 0.086 },
  icon: 'assets/gear/echoes/sacerdos.png',
  info_icon: 'assets/gear/echoes/info_sacerdos.png'
}

const cartethyia_cost_1_echo_3: Echo = {
  name: "Devotee's Flesh",
  cost: 1,
  baseStats: { flatHP: 2280, bonusHP: 0.228 },
  subStats: { critDamage: 0.150, bonusHP: 0.079, energyPercent: 0.108, bonusATK: 0.079, critRate: 0.093 },
  icon: 'assets/gear/echoes/devotee\'s_flesh.png',
  info_icon: 'assets/gear/echoes/info_devotee\'s_flesh.png'
}

// ========== Set Bonus ========================================================================================================
const cartethyia_set_bonus: EchoSetBonus = {
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
  },
  icon: 'assets/gear/set-bonuses/windward_pilgrimage.png'
}

export {
  // Weapon
  cartethyia_weapon,

  // Echoes
  cartethyia_cost_4_echo_1,
  cartethyia_cost_4_echo_2,
  cartethyia_cost_1_echo_1,
  cartethyia_cost_1_echo_2,
  cartethyia_cost_1_echo_3,

  // Set Bonus
  cartethyia_set_bonus
}