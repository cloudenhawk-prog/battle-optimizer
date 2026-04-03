import type { Echo, EchoSetBonus } from '../../types/gear'
import { always } from '../../utils/conditions/damageModifierConditions'
import { weaponCatalog, buildWeapon } from './weaponCatalog'

const SUBS = { critRate: 0.075, critDamage: 0.15, bonusHP: 0.079 }

// ========== Weapon ===========================================================================================================
const cartethyia_weapon = buildWeapon(weaponCatalog.find(w => w.name === "Defier's Thorn")!, 1, 'Cartethyia')!

// ========== Echoes ===========================================================================================================
const cartethyia_cost_4_echo_1: Echo = {
  name: 'Reminiscence: Fleurdelys',
  setName: 'Windward Pilgrimage',
  cost: 4,
  baseStats: { flatATK: 150, critDamage: 0.44 },
  subStats: SUBS,
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
  setName: 'Windward Pilgrimage',
  cost: 4,
  baseStats: { flatATK: 150, critRate: 0.22 },
  subStats: SUBS,
  icon: 'assets/gear/echoes/nightmare_kelpie.png',
  info: 'The Resonator with this Echo equipped in the main slot gains 12.00% Glacio DMG Bonus and 12.00% Aero DMG Bonus. Switching out the Resonator with Outro Skill summons Nightmare: Kelpie to deal 405.00% Aero DMG.',
  info_icon: 'assets/gear/echoes/info_nightmare_kelpie.png'
}

const cartethyia_cost_1_echo_1: Echo = {
  name: 'Spectro Drake',
  setName: 'Windward Pilgrimage',
  cost: 1,
  baseStats: { flatHP: 2280, bonusHP: 0.228 },
  subStats: SUBS,
  icon: 'assets/gear/echoes/spectro_drake.png',
  info_icon: 'assets/gear/echoes/info_spectro_drake.png'
}

const cartethyia_cost_1_echo_2: Echo = {
  name: 'Sacerdos',
  setName: 'Windward Pilgrimage',
  cost: 1,
  baseStats: { flatHP: 2280, bonusHP: 0.228 },
  subStats: SUBS,
  icon: 'assets/gear/echoes/sacerdos.png',
  info_icon: 'assets/gear/echoes/info_sacerdos.png'
}

const cartethyia_cost_1_echo_3: Echo = {
  name: "Devotee's Flesh",
  setName: 'Windward Pilgrimage',
  cost: 1,
  baseStats: { flatHP: 2280, bonusHP: 0.228 },
  subStats: SUBS,
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