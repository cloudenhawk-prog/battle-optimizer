import type { Action } from '../../types/action'
import { atLeastOneStackOf } from '../../utils/conditions/damageModifierConditions'
import { hiyuki } from '../characters/hiyuki'

// When Foreclaiming: Inward Vision or Iai hits a target, if the target has no fewer than 10 stacks of Glacio Bite, consume 10 stacks and trigger Frostbind once.
// Does Glacio Chafe even exists, isn't it all supposed to be converted to Glacio Bite?
// on status modification: refreshDuration: true or false?


// Intro
// Skill
// BA3 (enhanced)
// Liberation
// Foreclaimed: Skill 1
// Enhanced Forte (iai or enhanced heavy attack?)
// Forclaimed Heavy Attack
// Forclaimed BA2-5
// Enhanced Forte (iai or enhanced heavy attack?)
// Forclaimed Heavy Attack
// Forclaimed BA2-5
// Enhanced Forte (iai or enhanced heavy attack?)
// Forclaimed Heavy Attack
// Forclaimed: Liberation

// ========== Values ===========================================================================================================

// BA1
const BA1_multiplier = (34.80 + 34.80) / 100
const BA1_energy = (0.75 + 0.75)
const BA1_concerto = (1.13 + 1.13)
const BA1_offtune = (0.2 + 0.2)
const BA1_persistenceTime = 1000 // TODO

// BA2
const BA2_multiplier = (83.51) / 100
const BA2_energy = (1.8)
const BA2_concerto = (2.7)
const BA2_offtune = (0.48)
const BA2_persistenceTime = 1000 // TODO

// BA3
const BA3_multiplier = (5 * 4.46 + 89.07) / 100
const BA3_energy = (5 * 0.1 + 1.92)
const BA3_concerto = (5 * 0.15 + 2.88)
const BA3_dedication = 100
const BA3_offtune = (5 * 0.026 + 0.512)
const BA3_persistenceTime = 1000 // TODO

// Foreclaimed BA1
const foreclaimed_BA1_multiplier = (46.35) / 100
const foreclaimed_BA1_energy = (1.00)
const foreclaimed_BA1_concerto = (1.50)
const foreclaimed_BA1_stack = (0)
const foreclaimed_BA1_offtune = (0.27)

// Foreclaimed BA2
const foreclaimed_BA2_multiplier = (37.09 + 37.09) / 100
const foreclaimed_BA2_energy = (0.80 + 0.80)
const foreclaimed_BA2_concerto = (1.20 + 1.20)
const foreclaimed_BA2_stack = (0)
const foreclaimed_BA2_offtune = (0.21 + 0.21)

// Foreclaimed BA3
const foreclaimed_BA3_multiplier = (4 * 21.92 + 58.46) / 100
const foreclaimed_BA3_energy = (4 * 0.48 + 1.26)
const foreclaimed_BA3_concerto = (4 * 0.71 + 1.89)
const foreclaimed_BA3_stack = (1)
const foreclaimed_BA3_offtune = (4 * 0.13 + 0.34)

// Foreclaimed BA4
const foreclaimed_BA4_multiplier = (5 * 27.00) / 100
const foreclaimed_BA4_energy = (5 * 0.59)
const foreclaimed_BA4_concerto = (5 * 0.88)
const foreclaimed_BA4_stack = (1)
const foreclaimed_BA4_offtune = (5 * 0.16)

// Foreclaimed BA5
const foreclaimed_BA5_multiplier = (11.88 + 106.84) / 100
const foreclaimed_BA5_energy = (0.26 + 2.31)
const foreclaimed_BA5_concerto = (	0.39 + 3.46)
const foreclaimed_BA5_stack = (1)
const foreclaimed_BA5_offtune = (	0.07 + 0.61)

// ========== Present Self =====================================================================================================
const hiyuki_skill: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill',
  displayName: 'Frostblight',
  category: 'Skills',
  castTime: 1.00, // TODO
  multiplier: (4 * 22.62 + 90.46) / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['SKILL'],
  cooldown: 20,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.49 + 1.95, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 4 * 0.74 + 2.93, share: 0 },
    { energyType: 'dedication', amount: 100, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Present Self'],
  },
  offtune: 4 * 0.13 + 0.52,
  groupName: 'Resonance Skill',
  variantName: 'Default'
}

const hiyuki_BA_3_enhanced: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Basic Attack 3',
  displayName: 'Basic Attack 3',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: BA3_concerto, share: 0 },
    { energyType: 'dedication', amount: BA3_dedication + 100, share: 0 }
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Present Self'],
    previousActions: [hiyuki_skill],
    customCanCast(prevSnapshot) {
      const dedication = prevSnapshot?.charactersEnergies['Hiyuki']?.dedication ?? 0
      return dedication < 300
    },
  },
  offtune: BA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 3',
  variantName: 'Default',
}

const hiyuki_heavy_attack_enhanced: Action = {
  tags: ['HEAVY_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Enhanced Heavy Attack',
  displayName: 'Frost Splinter: Present Self',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: (2 * 71.58 + 143.15) / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 1.5 + 3, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 2.25 + 4.5, share: 0 },
    { energyType: 'foreclaiming', amount: 1, share: 0 }
  ],
  energyCost: [
    { energyType: 'dedication', amount: 300 }
  ],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 3 }], // TODO : Might be 1
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Present Self']
  },
  offtune: 2 * 0.4 + 0.8,
  groupName: 'Enhanced Heavy Attack',
  variantName: 'Default',
}

const hiyuki_liberation: Action = {
  tags: ['LIBERATION', 'GLACIO_CHAFE_APPLIER'],
  name: 'Liberation',
  displayName: 'Foreclaiming: Inward Vision',
  category: 'Skills',
  castTime: 1.00, // TODO
  multiplier: (397.62) / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 25,
  energyGenerated: [
    { energyType: 'concerto', amount: 20, share: 0 },
    { energyType: 'frostharden_iai', amount: 3, share: 0 }
  ],
  energyCost: [
    { energyType: 'foreclaiming', amount: 1 }
  ],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 4 }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Present Self']
  },
  offtune: 8.4,
  formChange: 'Foreclaimed Self'
}

// ========== Foreclaimed Self =================================================================================================
const hiyuki_foreclaimed_BA_1_5: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 1-5',
  displayName: 'Foreclaimed: Basic Attack 1-5',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: foreclaimed_BA1_multiplier + foreclaimed_BA2_multiplier + foreclaimed_BA3_multiplier + foreclaimed_BA4_multiplier + foreclaimed_BA5_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: foreclaimed_BA1_energy + foreclaimed_BA2_energy + foreclaimed_BA3_energy + foreclaimed_BA4_energy + foreclaimed_BA5_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: foreclaimed_BA1_concerto + foreclaimed_BA2_concerto + foreclaimed_BA3_concerto + foreclaimed_BA4_concerto + foreclaimed_BA5_concerto, share: 0 },
    { energyType: 'frostheart', amount: 100, share: 0 }, // TODO: Amount Uncertain
    { energyType: 'snow_rust', amount: 1, share: 0 }
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: foreclaimed_BA1_stack + foreclaimed_BA2_stack + foreclaimed_BA3_stack + foreclaimed_BA4_stack + foreclaimed_BA5_stack }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Foreclaimed Self']
  },
  offtune: foreclaimed_BA1_offtune + foreclaimed_BA2_offtune + foreclaimed_BA3_offtune + foreclaimed_BA4_offtune + foreclaimed_BA5_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 1-5',
  variantName: 'Default',
}

const hiyuki_foreclaimed_enhanced_heavy_attack: Action = {
  tags: ['HEAVY_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Enhanced Heavy Attack',
  displayName: 'Bitterfrost: Foreclaimed Self',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: (8 * 45.73 + 548.72) / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'snowforged_blade', amount: 1, share: 0 }
  ],
  energyCost: [
    { energyType: 'whiteout_bitterfrost', amount: 3 }
  ],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Foreclaimed Self']
  },
  offtune: 8 * 0.42 + 5.04,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Enhanced Heavy Attack',
  variantName: 'Default',
}

const hiyuki_foreclaimed_skill_1: Action = {
  tags: ['SKILL'],
  name: 'Foreclaimed: Resonance Skill 1',
  displayName: 'Frostblight: Jade Cleave',
  category: 'Skills',
  castTime: 1.00, // TODO
  multiplier: (4 * 57.66) / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['SKILL'],
  cooldown: 12,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 2.54, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 4 * 0.66, share: 0 },
    { energyType: 'frostheart', amount: 100, share: 0 } // TODO: Amount Uncertain
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Foreclaimed Self']
  },
  offtune: 4 * 0.12,
  groupName: 'Foreclaimed Resonance Skill',
  variantName: 'Jade Cleave',
}

const hiyuki_foreclaimed_skill_2: Action = {
  tags: ['SKILL'],
  name: 'Foreclaimed: Resonance Skill 2',
  displayName: 'Frostblight: Petalfall',
  category: 'Skills',
  castTime: 1.00, // TODO
  multiplier: (4 * 55.67 + 55.67) / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['SKILL'],
  cooldown: 12,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 2.10 + 2.10, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 4 * 0.63 + 0.63, share: 0 },
    { energyType: 'frostheart', amount: 100, share: 0 } // TODO: Amount Uncertain
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
    requiredForms: ['Foreclaimed Self']
  },
  offtune: 4 * 0.11 + 0.11,
  groupName: 'Foreclaimed Resonance Skill',
  variantName: 'Petalfall',
}

// Iai can be cast after Iai (as long as frostheart >= 100)
const hiyuki_foreclaimed_iai: Action = {
  name: 'Foreclaimed: Iai',
  displayName: 'Iai',
  category: 'Skills',
  castTime: 1.00, // TODO
  multiplier: (243.35 + 4 * 40.56) / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 1.23, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 4 * 0.33, share: 0 }
  ],
  energyCost: [
    { energyType: 'frostheart', amount: 100 }
  ],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Foreclaimed Self'],
    previousActions: [
      { name: 'Foreclaimed: Iai' } as Action,
      hiyuki_foreclaimed_BA_1_5,
      hiyuki_foreclaimed_skill_1,
      hiyuki_foreclaimed_skill_2
    ]
  },
  offtune: 1.84,
  resolveVariant(prevSnapshot, characterName) {
    const energies = prevSnapshot?.charactersEnergies[characterName]
    const frosthardenIai = energies?.frostharden_iai ?? 0

    if (frosthardenIai > 0) {
      return {
        ...this,
        multiplier: this.multiplier * 2,
        energyGenerated: [
          ...this.energyGenerated.map(e => ({ ...e, amount: e.amount * 2 })),
          { energyType: 'whiteout_bitterfrost' as const, amount: 1, share: 0 },
        ],
        energyCost: [
          ...this.energyCost,
          { energyType: 'frostharden_iai' as const, amount: 1 },
        ],
        statusModifications: [
          ...this.statusModifications,
          { type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: 3 }, // TODO : In this case, it should also have the tag ['GLACIO_CHAFE_APPLIER']
        ],
        offtune: this.offtune * 2,
        resolveVariant: undefined,
      }
    }
    return { ...this, resolveVariant: undefined }
  }
}












// ========== Intro & Outro ====================================================================================================
const hiyuki_intro: Action = { // In Foreclainmed self, can follow up with Basic Attack - Foreclaimed Self Stage 2
  tags: ['INTRO_ACTION', 'GLACIO_CHAFE_APPLIER'],
  name: 'Hiyuki Intro',
  displayName: 'Frostedge',
  category: 'Other',
  castTime: 1.0, // TODO
  multiplier: (139.17) / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'dedication', amount: 100, share: 0 } // TODO : only in form: Present self!
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Glacio Chafe',
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
  offtune: 0.8,
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
      condition: ctx => atLeastOneStackOf('Glacio Chafe')(ctx) ? 1 : 0,
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
  scaling: 'ATK',
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
  scaling: 'ATK',
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
  scaling: 'ATK',
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
  }
}

// ========== Energies =========================================================================================================
const hiyuki_energy: Action = {
  name: 'Energy Up',
  displayName: 'Energy Up',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'ATK',
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
  scaling: 'ATK',
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
  scaling: 'ATK',
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
  hiyuki_skill,
  hiyuki_BA_3_enhanced,
  hiyuki_heavy_attack_enhanced,
  hiyuki_liberation,
  hiyuki_foreclaimed_BA_1_5,
  hiyuki_foreclaimed_enhanced_heavy_attack,
  hiyuki_foreclaimed_skill_1,
  hiyuki_foreclaimed_skill_2,
  hiyuki_foreclaimed_iai,

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

