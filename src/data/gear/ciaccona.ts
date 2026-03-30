import type { Echo, EchoSetBonus } from '../../types/gear'
import { always } from '../../utils/conditions/damageModifierConditions'
import { nightmareKelpieOutroTrigger } from '../sideEffects/sideEffects'
import { weaponCatalog, buildWeapon } from './weaponCatalog'

// ========== Weapon ===========================================================================================================
const ciaccona_weapon = buildWeapon(weaponCatalog.find(w => w.name === 'Static Mist')!, 3, 'Ciaccona')!

// ========== Echoes ===========================================================================================================
const ciaccona_cost_4_echo_1: Echo = {
  name: 'Nightmare: Kelpie',
  setName: 'Gusts of Welkin',
  cost: 4,
  baseStats: { flatATK: 150, critDamage: 0.44 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 },
  firstSlotStats: { aeroBonusDMG: 0.12, glacioBonusDMG: 0.12 },
  echoSkill: {
    name: 'Nightmare: Kelpie (Active)',
    displayName: 'Nightmare: Kelpie (Active)',
    category: 'Echo Skill',
    castTime: 0,
    multiplier: 405 / 100,
    scaling: 'ATK',
    elements: ['GLACIO'],
    dmgTypes: ['ECHO'],
    cooldown: 25,
    energyGenerated: [{ energyType: 'energy', amount: 2.81, share: 0.5, scalingStat: 'energyPercent' }],
    energyCost: [],
    statusModifications: [],
    damageModifiers: [],
    sideEffects: [],
    castConditions: {
      startState: 'GROUND', // TODO check this
      endState: 'AIR', // TODO check this
      // TODO - might always count as a swap; use persistenceTime, swapOutState etc?
    },
    offtune: 0,
  },
  injectedSideEffects: [
    {
      targets: [{ tag: 'OUTRO_ACTION' }],
      sideEffects: [nightmareKelpieOutroTrigger]
    }
  ],
  info: 'The Resonator with this Echo equipped in the main slot gains 12.00% Glacio DMG Bonus and 12.00% Aero DMG Bonus. Switching out the Resonator with Outro Skill summons Nightmare: Kelpie to deal 405.00% Aero DMG.',
  icon: 'assets/gear/echoes/nightmare_kelpie.png',
  info_icon: 'assets/gear/echoes/info/info_nightmare_kelpie.png'
}

const ciaccona_cost_3_echo_1: Echo = {
  name: 'Capitaneus',
  setName: 'Gusts of Welkin',
  cost: 3,
  baseStats: { flatATK: 100, aeroBonusDMG: 0.30 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 },
  icon: 'assets/gear/echoes/capitaneus.png',
  info: 'The Resonator with this Echo equipped in their main slot gains 12.00% Spectro DMG Bonus and 12.00% Heavy Attack DMG Bonus.',
  info_icon: 'assets/gear/echoes/info_capitaneus.png'
}

const ciaccona_cost_3_echo_2: Echo = {
  name: 'Hurriclaw',
  setName: 'Gusts of Welkin',
  cost: 3,
  baseStats: { flatATK: 100, aeroBonusDMG: 0.30 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 },
  icon: 'assets/gear/echoes/hurriclaw.png',
  info_icon: 'assets/gear/echoes/info_hurriclaw.png'
}

const ciaccona_cost_1_echo_1: Echo = {
  name: 'Sacerdos',
  setName: 'Gusts of Welkin',
  cost: 1,
  baseStats: { flatHP: 2280, bonusATK: 0.18 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 },
  icon: 'assets/gear/echoes/sagittario.png',
  info_icon: 'assets/gear/echoes/info_sagittario.png'
}

const ciaccona_cost_1_echo_2: Echo = {
  name: 'Sacerdos',
  setName: 'Gusts of Welkin',
  cost: 1,
  baseStats: { flatHP: 2280, bonusATK: 0.18 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 },
  icon: 'assets/gear/echoes/sacerdos.png',
  info_icon: 'assets/gear/echoes/info_sacerdos.png'
}

// ========== Set Bonus ========================================================================================================
const ciaccona_set_bonus: EchoSetBonus = {
  name: 'Gusts of Welkin',
  stats: { aeroBonusDMG: 0.10 },
  injectedModifiers: [
    {
      targets: [{ tag: 'AERO_EROSION_APPLIER' }],
      modifiers: [
        {
          source: 'Ciaccona',
          displayName: 'Gusts of Welkin (Self Buff)',
          type: 'buff',
          ownerCharacter: 'Ciaccona',
          characterStats: { aeroBonusDMG: 0.15 },
          condition: always(),
          targetStrategy: 'self',
          durationStrategy: { type: 'limited', timeDuration: 20 },
          stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
        },
        {
          source: 'Ciaccona',
          displayName: 'Gusts of Welkin (Team Buff)',
          type: 'buff',
          ownerCharacter: 'Ciaccona',
          characterStats: { aeroBonusDMG: 0.15 },
          condition: always(),
          targetStrategy: 'all',
          durationStrategy: { type: 'limited', timeDuration: 20 },
          stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
        }
      ]
    }
  ],
  info: {
    '2-piece': 'Aero DMG + 10%',
    '5-piece': 'Inflicting Aero Erosion upon enemies increases Aero DMG for all Resonators in the team by 15%, and for the Resonator triggering this effect by an additional 15%, lasting for 20s.'
  },
  icon: 'assets/gear/set-bonuses/gusts_of_welkin.png'
}

export {
  // Weapon
  ciaccona_weapon,

  // Echoes
  ciaccona_cost_4_echo_1,
  ciaccona_cost_3_echo_1,
  ciaccona_cost_3_echo_2,
  ciaccona_cost_1_echo_1,
  ciaccona_cost_1_echo_2,

  // Set Bonus
  ciaccona_set_bonus
}