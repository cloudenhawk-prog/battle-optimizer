import type { Echo, EchoSetBonus, Weapon } from '../../types/gear'
import { always } from '../../utils/conditions/damageModifierConditions'
import { ciaccona_BA_3_4_cancel_with_skill, ciaccona_BA_3_4_cancel_with_swap, ciaccona_midair_2_BA_4_cancel_with_skill, ciaccona_midair_2_BA_4_cancel_with_swap, ciaccona_outro, ciaccona_skill, ciaccona_skill_cancel_with_swap } from '../actions/ciaccona'
import { ciaccona_singers_triple_cadenza_coordinated } from '../coordinatedAttacks/ciaccona'
import { nightmareKelpieOutroTrigger } from '../sideEffects'

// ========== Weapon ===========================================================================================================
const ciaccona_weapon: Weapon = {
  name: 'Static Mist',
  stats: { flatATK: 587.50, critRate: 0.2430, energyPercent: 0.192 },
  injectedModifiers: [
    {
      targets: [ciaccona_outro], // TODO: Would this correctly inject it into ciaccona's outro action?
      modifiers: [
        {
          source: 'Static Mist',
          displayName: 'Static Mist Outro Buff',
          type: 'buff',
          ownerCharacter: 'Ciaccona',
          condition: always(),
          characterStats: { bonusATK: 0.15 },
          targetStrategy: 'nextSwap',
          durationStrategy: { type: 'limited', timeDuration: 14, numberOfSwaps: 1 }, // TODO: would this correctly give only the next character after the outro 15 % ATK for 14 seconds (NOT herself, and not 2 future characters, just the next one until swapped out again)?
          stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
        }
      ]
    }
  ],
  rank:3 
}

// ========== Echoes ===========================================================================================================
const ciaccona_cost_4_echo_1: Echo = {
  name: 'Nightmare: Kelpie',
  cost: 4,
  baseStats: { flatATK: 150, critDamage: 0.44 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 },
  firstSlotStats: { aeroBonusDMG: 0.12, glacioBonusDMG: 0.12 },
  echoSkill: {
    name: 'Nightmare: Kelpie (Active)',
    displayName: 'Nightmare: Kelpie (Active)',
    category: 'Other',
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
      targets: [ciaccona_outro],
      sideEffects: [nightmareKelpieOutroTrigger]
    }
  ]
}

const ciaccona_cost_3_echo_1: Echo = {
  name: 'Capitaneus',
  cost: 3,
  baseStats: { flatATK: 100, aeroBonusDMG: 0.30 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 }
}

const ciaccona_cost_3_echo_2: Echo = {
  name: 'Capitaneus',
  cost: 3,
  baseStats: { flatATK: 100, aeroBonusDMG: 0.30 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 }
}

const ciaccona_cost_1_echo_1: Echo = {
  name: 'Sagittario',
  cost: 1,
  baseStats: { flatHP: 2280, bonusATK: 0.18 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 }
}

const ciaccona_cost_1_echo_2: Echo = {
  name: 'Sacerdos',
  cost: 1,
  baseStats: { flatHP: 2280, bonusATK: 0.18 },
  subStats: { critRate: 0.075, critDamage: 0.150, bonusATK: 0.079 }
}

// ========== Set Bonus ========================================================================================================
const ciaccona_set_bonus: EchoSetBonus = {
  name: 'Gusts of Welkin',
  stats: { aeroBonusDMG: 0.10 },
  injectedModifiers: [
    {
      targets: [ciaccona_BA_3_4_cancel_with_skill, ciaccona_BA_3_4_cancel_with_swap, ciaccona_midair_2_BA_4_cancel_with_skill, ciaccona_midair_2_BA_4_cancel_with_swap, ciaccona_skill, ciaccona_skill_cancel_with_swap, ciaccona_singers_triple_cadenza_coordinated],
      modifiers: [
        {
          source: 'Ciaccona',
          displayName: 'Windward Pilgrimage (Self Buff)',
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
          displayName: 'Windward Pilgrimage (Team Buff)',
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
  ]
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