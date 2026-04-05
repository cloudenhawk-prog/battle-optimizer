import type { Action } from '../../types/action'
import { atLeastOneStackOf } from '../../utils/conditions/damageModifierConditions'

// ========== Values ===========================================================================================================

// BA1
const BA1_multiplier = (1000) / 100
const BA1_energy = (1000)
const BA1_concerto = (1000)
const BA1_forte = 1000
const BA1_offtune = (1000)
const BA1_persistenceTime = 1000

// BA2
const BA2_multiplier = (1000) / 100
const BA2_energy = (1000)
const BA2_concerto = (1000)
const BA2_forte = 1000
const BA2_offtune = (1000)
const BA2_persistenceTime = 1000

// BA3
const BA3_multiplier = (1000) / 100
const BA3_energy = (1000)
const BA3_concerto = (1000)
const BA3_forte = 1000
const BA3_offtune = (1000)
const BA3_persistenceTime = 1000

// ========== Basics ===========================================================================================================





// ========== Intro & Outro ====================================================================================================
const hiyuki_intro: Action = {
  tags: ['INTRO_ACTION'],
  name: 'Hiyuki Intro',
  displayName: 'Frostedge',
  category: 'Other',
  castTime: 1.0, // TODO
  multiplier: (100) / 100, // TODO
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 100, share: 0.5, scalingStat: 'energyPercent' }, // TODO
    { energyType: 'concerto', amount: 100, share: 0 } // TODO
    // TODO: depending on form, gives 100 special energy
    // TODO: depending on form, allows for a follow up attack
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Frost Bite',
      stackChange: 1,
      refreshDuration: true
    }
  ],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE', // TODO
  },
  offtune: 100, // TODO
}

const hiyuki_outro: Action = {
  tags: ['OUTRO_ACTION'],
  name: 'Outro',
  displayName: 'Snowlight Blessing',
  category: 'Other',
  castTime: 0,
  multiplier: 0,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['OUTRO'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Hiyuki Outro Buff',
      displayName: 'Snowlight Blessing',
      type: 'buff',
      ownerCharacter: 'Hiyuki',
      characterStats: { glacioAmplifyDMG: 0.20 },
      condition: ctx => atLeastOneStackOf('Glacio Chafe')(ctx) || atLeastOneStackOf('Glacio Bite')(ctx) ? 1 : 0,
      targetStrategy: 'allExceptSelf',
      durationStrategy: { type: 'limited', timeDuration: 20 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      color: '#FFD700',
      description: 'For 20 seconds: all Resonators except Hiyuki gain 20% Glacio DMG Amplification against targets affected by Glacio Chafe.',
      showStats: true
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

// ========== Swaps ============================================================================================================
const hiyuki_wait_005: Action = {
  name: 'Wait 0.05s',
  displayName: 'Wait 0.05s',
  category: 'Other',
  castTime: 0.05,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

const hiyuki_wait_1: Action = {
  name: 'Wait 1s',
  displayName: 'Wait 1s',
  category: 'Other',
  castTime: 1,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

const hiyuki_wait_for_swap: Action = {
  name: 'Wait Until Next Swap Is Available',
  displayName: 'Wait Until Next Swap Is Available',
  category: 'Other',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
    customCanCast(prevSnapshot) {
      if (!prevSnapshot) return false
      const cooldowns = prevSnapshot.charactersSwapCooldownUntil ?? {}
      return Object.values(cooldowns).some(until => until - prevSnapshot.toTime > 0)
    },
  },
  offtune: 0,
  resolveVariant(prevSnapshot) {
    const cooldowns = prevSnapshot?.charactersSwapCooldownUntil ?? {}
    const toTime = prevSnapshot?.toTime ?? 0
    const remaining = Object.values(cooldowns)
      .map(until => until - toTime)
      .filter(r => r > 0)
    const castTime = remaining.length > 0 ? Math.min(...remaining) : 0
    return { ...this, castTime, resolveVariant: undefined }
  },
}

// ========== Energies =========================================================================================================
const hiyuki_energy: Action = {
  name: 'Energy Up',
  displayName: 'Energy Up',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'energy', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

const hiyuki_concerto: Action = {
  name: 'Concerto Up',
  displayName: 'Concerto Up',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'concerto', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

const hiyuki_forte: Action = {
  name: 'Forte Up',
  displayName: 'Forte Up',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'forte', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

export const hiyuki_intro_outro_actions = [hiyuki_intro, hiyuki_outro]

export const all_actions = [
  ...hiyuki_intro_outro_actions,
  hiyuki_wait_005,
  hiyuki_wait_for_swap,
  hiyuki_energy,
  hiyuki_concerto,
  hiyuki_forte
]

export {

  // Intro / Outro
  hiyuki_intro,
  hiyuki_outro,

  // Swaps
  hiyuki_wait_005,
  hiyuki_wait_1,
  hiyuki_wait_for_swap,

  // Testing
  hiyuki_energy,
  hiyuki_concerto,
  hiyuki_forte
}

