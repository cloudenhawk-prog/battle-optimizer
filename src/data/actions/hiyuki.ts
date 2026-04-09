import type { Action } from '../../types/action'
import { atLeastOneStackOf, always } from '../../utils/conditions/damageModifierConditions'

// When Foreclaiming: Inward Vision or Iai hits a target, if the target has no fewer than 10 stacks of Glacio Bite, consume 10 stacks and trigger Frostbind once.
// Does Glacio Chafe even exists, isn't it all supposed to be converted to Glacio Bite?
// on status modification: refreshDuration: true or false?

// TODO : need a version of Foreclaiming skill and normal skill where you cancel the animation entirely and chain it into the next step (0 dmg, but might save lots of time)

// COMBO IDEA 1 -----------------------------------------------
// ONLY FIRST ROTATION
//! Resonance Skill
//! Basic Attack (Stage 3) (Swap out)

// FORM ROTATION
// Intro Skill
// Enhanced Heavy Attack
// Resonance Liberation (First Activation)
// Foreclaimed: Resonance Skill
// Foreclaimed: Mid-Air Attack (Stage 1)
// Foreclaimed: Mid-Air Attack (Stage 2)
// Foreclaimed: Mid-Air Attack (Stage 3)
// Foreclaimed: Basic Attack (Stage 1)
// Foreclaimed: Basic Attack (Stage 2)
// Foreclaimed: Basic Attack (Stage 3)
// Foreclaimed: Basic Attack (Stage 4)
// Foreclaimed: Basic Attack (Stage 5)
// Dash Cancel
// Foreclaimed: Iai Slash (Basic Attack input)
// Foreclaimed: Iai Slash (Basic Attack input)
// Foreclaimed: Iai Slash (Basic Attack input)
  // Here you could do second skill (cancel) + another iai slash (not enhanced)
// Foreclaimed: Enhanced Heavy Attack
// Foreclaimed: Resonance Liberation (Second Activation, Tap Version)
// Outro Skill

// FINISHER
// Resonance Skill
// Basic Attack (Stage 3)
// Outro Skill

// COMBO IDEA 2 -----------------------------------------------
// Enhanced Basic Attack (Stage 1)
// Enhanced Basic Attack (Stage 2)
// Enhanced Basic Attack (Stage 3)
// Enhanced Basic Attack (Stage 4)
// Enhanced Basic Attack (Stage 5)
// Enhanced Basic Attack (Stage 1)
// Resonance Skill
// Enhanced Mid-Air Attack (Stage 1)
// Enhanced Mid-Air Attack (Stage 2)
// Enhanced Mid-Air Attack (Stage 3)
// Enhanced Basic Attack (Stage 1)
// Enhanced Heavy Attack
// Basic Attack (Stage 1)
// Iai Slash (Basic Attack input)
// Iai Slash (Basic Attack input)
// Iai Slash (Basic Attack input)

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

// Foreclaimed MA1
const foreclaimed_MA1_multiplier = (2 * 32.03 + 42.70) / 100
const foreclaimed_MA1_energy = (2 * 0.70 + 0.93)
const foreclaimed_MA1_concerto = (2 * 1.04 + 1.39)
const foreclaimed_MA1_stack = (0)
const foreclaimed_MA1_offtune = (2 * 0.18 + 0.25)

// Foreclaimed MA2
const foreclaimed_MA2_multiplier = (4 * 28.99) / 100
const foreclaimed_MA2_energy = (4 * 0.63)
const foreclaimed_MA2_concerto = (4 * 0.94)
const foreclaimed_MA2_stack = (1)
const foreclaimed_MA2_offtune = (4 * 0.17)

// Foreclaimed MAP
const foreclaimed_MAP_multiplier = (4 * 12.11 + 72.65) / 100
const foreclaimed_MAP_energy = (4 * 0.27 + 1.57)
const foreclaimed_MAP_concerto = (4 * 0.40 + 2.35)
const foreclaimed_MAP_stack = (1)
const foreclaimed_MAP_offtune = (4 * 0.07 + 0.42)

// ========== S4 Shared Modifier ===============================================================================================
const hiyuki_s4_skill_buff = {
  source: 'Hiyuki: S4',
  displayName: 'Ephemeral Realm',
  type: 'buff',
  ownerCharacter: 'Hiyuki',
  color: '#dbe9ff',
  characterStats: { bonusDMG: 0.20 },
  condition: always(),
  targetStrategy: 'all',
  durationStrategy: { type: 'limited', timeDuration: 30 },
  stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
  description: '[S4] Casting Resonance Skill: Present Self, Frostblight: Jade Cleave, or Frostblight: Petalfall increases the damage dealt by all nearby Resonators in the team by 20% for 30s.',
}

// ========== Present Self: Resonance Skill ====================================================================================
// TODO: Try cancel with dodge
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
    requiredForms: ['Present Self']
  },
  offtune: 4 * 0.13 + 0.52,
  groupName: 'Resonance Skill',
  variantName: 'Default',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    if (owner.sequence < 4) return { ...this, resolveVariant: undefined }
    // S5: DMG Multiplier increased by 80%.
    const s5Multiplier = owner.sequence >= 5 ? 1.8 : 1
    return {
      ...this,
      multiplier: this.multiplier * s5Multiplier,
      damageModifiers: [...this.damageModifiers, hiyuki_s4_skill_buff],
      resolveVariant: undefined,
    }
  },
}

const hiyuki_skill_cancel_with_swap: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill (swap cancel)',
  displayName: 'Frostblight (Swap Cancel)',
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
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1.00, // TODO
    requiredForms: ['Present Self']
  },
  offtune: 4 * 0.13 + 0.52,
  groupName: 'Resonance Skill',
  variantName: 'Cancel With Swap',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    if (owner.sequence < 4) return { ...this, resolveVariant: undefined }
    // S5: DMG Multiplier increased by 80%.
    const s5Multiplier = owner.sequence >= 5 ? 1.8 : 1
    return {
      ...this,
      multiplier: this.multiplier * s5Multiplier,
      damageModifiers: [...this.damageModifiers, hiyuki_s4_skill_buff],
      resolveVariant: undefined,
    }
  }
}

// ========== Present Self: Basic Attack 3 =====================================================================================
// TODO: Is this castable after swapping? If not it should require immediate follow up always!
// TODO: Try cancel with dodge
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
    { energyType: 'dedication', amount: BA3_dedication + 100, share: 0 } // TODO Might be 0 vs 100, not 100 vs 200
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
  groupName: 'Basic Attack 3 (Enhanced)',
  variantName: 'Default',
}

const hiyuki_BA_3_enhanced_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Basic Attack 3 (swap cancel)',
  displayName: 'Basic Attack 3 (swap cancel)',
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
    { energyType: 'dedication', amount: BA3_dedication + 100, share: 0 } // TODO Might be 0 vs 100, not 100 vs 200
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1.00, // TODO
    requiredForms: ['Present Self'],
    previousActions: [hiyuki_skill],
    customCanCast(prevSnapshot) {
      const dedication = prevSnapshot?.charactersEnergies['Hiyuki']?.dedication ?? 0
      return dedication < 300
    },
  },
  offtune: BA3_offtune,
  groupName: 'Basic Attack 3 (Enhanced)',
  variantName: 'Cancel With Swap'
}

// ========== Present Self: Enhanced Heavy Attack ==============================================================================
// TODO: Try cancel with dodge
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
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S3: DMG Multiplier of Frost Splinter: Present Self is increased by 120%.
    if (owner.sequence < 3) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  },
}

const hiyuki_heavy_attack_enhanced_cancel_with_swap: Action = {
  tags: ['HEAVY_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Enhanced Heavy Attack (swap cancel)',
  displayName: 'Frost Splinter: Present Self (Swap Cancel)',
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
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1.00, // TODO
    requiredForms: ['Present Self']
  },
  offtune: 2 * 0.4 + 0.8,
  groupName: 'Enhanced Heavy Attack',
  variantName: 'Cancel With Swap',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S3: DMG Multiplier of Frost Splinter: Present Self is increased by 120%.
    if (owner.sequence < 3) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  },
}

// ========== Present Self: Liberation =========================================================================================
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
  formChange: 'Foreclaimed Self',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: Casting this action enhances the next Basic Attack 1-5 so that BA1 & BA2 also apply
    // Glacio Chafe. Grant a one-shot s1_enhanced_ba token consumed by hiyuki_foreclaimed_BA_1_5.
    // S6: DMG Multiplier of Foreclaiming: Inward Vision is increased by 150%.
    const s6Multiplier = owner.sequence >= 6 ? 2.5 : 1
    if (owner.sequence >= 1) {
      return {
        ...this,
        multiplier: this.multiplier * s6Multiplier,
        energyGenerated: [
          ...this.energyGenerated,
          { energyType: 's1_enhanced_ba' as const, amount: 1, share: 0 },
        ],
        resolveVariant: undefined,
      }
    }
    return { ...this, multiplier: this.multiplier * s6Multiplier, resolveVariant: undefined }
  },
}

// ========== Foreclaimed Self: Basic Attack 1 =================================================================================
// TODO: Try cancel with dodge for all Basic Attacks

// const hiyuki_foreclaimed_BA_1
// const hiyuki_foreclaimed_BA_1_cancel_with_swap

// const hiyuki_foreclaimed_BA_1_2
// const hiyuki_foreclaimed_BA_1_2_cancel_with_swap

// const hiyuki_foreclaimed_BA_1_3
// const hiyuki_foreclaimed_BA_1_3_cancel_with_swap

// const hiyuki_foreclaimed_BA_1_4
// const hiyuki_foreclaimed_BA_1_4_cancel_with_swap

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
    { energyType: 'frostheart', amount: 100, share: 0 } // TODO: Amount Uncertain
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: foreclaimed_BA1_stack + foreclaimed_BA2_stack + foreclaimed_BA3_stack + foreclaimed_BA4_stack + foreclaimed_BA5_stack, applicationCount: 3 }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Foreclaimed Self'],
    blockedComboTags: ['FORECLAIMED_BA1', 'FORECLAIMED_BA2', 'FORECLAIMED_BA3', 'FORECLAIMED_BA4']
  },
  comboChainTags: ['FORECLAIMED_BA5'],
  offtune: foreclaimed_BA1_offtune + foreclaimed_BA2_offtune + foreclaimed_BA3_offtune + foreclaimed_BA4_offtune + foreclaimed_BA5_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 1-5',
  variantName: 'Default',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA1 and BA2 each apply +1 Glacio Chafe, consuming the s1_enhanced_ba token.
    const s1Active = owner.sequence >= 1

    // TODO: Need to check both s1_enhanced_ba1 and s1_enhanced_ba2. Consume the ones present and add them to energy cost.
    // TODO: each consumed increases statusmodification stackChange +1 and applicationCount +1 (default is +0 and 3 respectively) 
    const s1Enhanced = s1Active && (prevSnapshot?.charactersEnergies[characterName]?.s1_enhanced_ba ?? 0) >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return {
      ...this,
      multiplier: this.multiplier * 2.2,
      ...(s1Enhanced ? {
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: foreclaimed_BA1_stack + foreclaimed_BA2_stack + foreclaimed_BA3_stack + foreclaimed_BA4_stack + foreclaimed_BA5_stack + 2, applicationCount: 5 }],
        energyCost: [
          ...this.energyCost,
          { energyType: 's1_enhanced_ba' as const, amount: 1 },
        ],
      } : {}),
      resolveVariant: undefined,
    }
  },
}

const hiyuki_foreclaimed_BA_1_5_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 1-5 (swap cancel)',
  displayName: 'Foreclaimed: Basic Attack 1-5 (swap cancel)',
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
    { energyType: 'frostheart', amount: 100, share: 0 } // TODO: Amount Uncertain
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: foreclaimed_BA1_stack + foreclaimed_BA2_stack + foreclaimed_BA3_stack + foreclaimed_BA4_stack + foreclaimed_BA5_stack, applicationCount: 3 }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1.00, // TODO
    requiredForms: ['Foreclaimed Self'],
    blockedComboTags: ['FORECLAIMED_BA1', 'FORECLAIMED_BA2', 'FORECLAIMED_BA3', 'FORECLAIMED_BA4']
  },
  comboChainTags: ['FORECLAIMED_BA5'],
  offtune: foreclaimed_BA1_offtune + foreclaimed_BA2_offtune + foreclaimed_BA3_offtune + foreclaimed_BA4_offtune + foreclaimed_BA5_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 1-5 (swap cancel)',
  variantName: 'Cancel With Swap',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA1 and BA2 each apply +1 Glacio Chafe, consuming the s1_enhanced_ba token.
    const s1Active = owner.sequence >= 1

    // TODO: Need to check both s1_enhanced_ba1 and s1_enhanced_ba2. Consume the ones present and add them to energy cost.
    // TODO: each consumed increases statusmodification stackChange +1 and applicationCount +1 (default is +0 and 3 respectively) 
    const s1Enhanced = s1Active && (prevSnapshot?.charactersEnergies[characterName]?.s1_enhanced_ba ?? 0) >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return {
      ...this,
      multiplier: this.multiplier * 2.2,
      ...(s1Enhanced ? {
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: foreclaimed_BA1_stack + foreclaimed_BA2_stack + foreclaimed_BA3_stack + foreclaimed_BA4_stack + foreclaimed_BA5_stack + 2, applicationCount: 5 }],
        energyCost: [
          ...this.energyCost,
          { energyType: 's1_enhanced_ba' as const, amount: 1 },
        ],
      } : {}),
      resolveVariant: undefined,
    }
  },
}

// ========== Foreclaimed Self: Basic Attack 2 =================================================================================

// const hiyuki_foreclaimed_BA_2
// const hiyuki_foreclaimed_BA_2_cancel_with_swap

// const hiyuki_foreclaimed_BA_2_3
// const hiyuki_foreclaimed_BA_2_3_cancel_with_swap


// const hiyuki_foreclaimed_BA_2_4
// const hiyuki_foreclaimed_BA_2_4_cancel_with_swap

// const hiyuki_foreclaimed_BA_2_5
// const hiyuki_foreclaimed_BA_2_5_cancel_with_swap



// ========== Foreclaimed Self: Basic Attack 3 =================================================================================

// const hiyuki_foreclaimed_BA_3
// const hiyuki_foreclaimed_BA_3_cancel_with_swap

// const hiyuki_foreclaimed_BA_3_4
// const hiyuki_foreclaimed_BA_3_4_cancel_with_swap

// const hiyuki_foreclaimed_BA_3_5
// const hiyuki_foreclaimed_BA_3_5_cancel_with_swap



// ========== Foreclaimed Self: Basic Attack 4 =================================================================================

// const hiyuki_foreclaimed_BA_4
// const hiyuki_foreclaimed_BA_4_cancel_with_swap

// const hiyuki_foreclaimed_BA_4_5
// const hiyuki_foreclaimed_BA_4_5_cancel_with_swap



// ========== Foreclaimed Self: Basic Attack 5 =================================================================================

// const hiyuki_foreclaimed_BA_5
// const hiyuki_foreclaimed_BA_5_cancel_with_swap



// ========== Foreclaimed Self: Mid Air Attack 1 ===============================================================================
// TODO: Try cancel with dodge for all Mid-air Attacks
// TODO: What other actions can be cast in mid-air? Liberation, skills? Enhanced Heavy Attack?

// const hiyuki_foreclaimed_midair_1
// const hiyuki_foreclaimed_midair_1_cancel_with_swap

// const hiyuki_foreclaimed_midair_1_2
// const hiyuki_foreclaimed_midair_1_2_cancel_with_swap

// const hiyuki_foreclaimed_midair_1_3
// const hiyuki_foreclaimed_midair_1_3_cancel_with_swap

const hiyuki_foreclaimed_midair_1_2: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Mid-air Attack 1-2',
  displayName: 'Foreclaimed: Mid-air Attack 1-2',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: foreclaimed_MA1_multiplier + foreclaimed_MA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: foreclaimed_MA1_energy + foreclaimed_MA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: foreclaimed_MA1_concerto + foreclaimed_MA2_concerto, share: 0 },
    { energyType: 'frostheart', amount: 100, share: 0 } // TODO: Amount Uncertain
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: foreclaimed_MA1_stack + foreclaimed_MA2_stack, applicationCount: 1 }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
    requiredForms: ['Foreclaimed Self'],
    blockedComboTags: ['FORECLAIMED_MA1', 'FORECLAIMED_MA2']
  },
  offtune: foreclaimed_MA1_offtune + foreclaimed_MA2_offtune,
  comboChainTags: ['FORECLAIMED_MA2'],
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Mid-air Attack 1-2',
  variantName: 'Default',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Mid-air Attack - Foreclaimed Self are increased by 120%.
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  },
}

// ========== Foreclaimed Self: Mid Air Attack 2 ===============================================================================

// const hiyuki_foreclaimed_midair_2
// const hiyuki_foreclaimed_midair_2_cancel_with_swap

// const hiyuki_foreclaimed_midair_2_3
// const hiyuki_foreclaimed_midair_2_3_cancel_with_swap



// ========== Foreclaimed Self: Mid Air Attack 3 ===============================================================================

// const hiyuki_foreclaimed_midair_plunge_cancel_with_swap

const hiyuki_foreclaimed_midair_plunge: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Mid-air Plunge',
  displayName: 'Foreclaimed: Mid-air Plunge',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: foreclaimed_MAP_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: foreclaimed_MAP_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: foreclaimed_MAP_concerto, share: 0 },
    { energyType: 'frostheart', amount: 100, share: 0 } // TODO: Amount Uncertain
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: foreclaimed_MAP_stack, applicationCount: 1 }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['FORECLAIMED_MA2']
  },
  offtune: foreclaimed_MAP_offtune,
  hideWhenNotCastable: true,
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Mid-air Attack - Foreclaimed Self are increased by 120%.
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  },
}

// ========== Foreclaimed Self: Enhanced Heavy Attack ==========================================================================
// TODO: Try cancel with dodge

// const hiyuki_foreclaimed_enhanced_heavy_attack_cancel_with_swap

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
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S3: Additional +120%
    if (owner.sequence < 1) return { ...this, resolveVariant: undefined }
    return {
      ...this,
      multiplier: this.multiplier * 2.2,
      resolveVariant: undefined,
    }
  },
}

// ========== Foreclaimed Self: Resonance Skill 1 ==============================================================================
// TODO: Try cancel with dodge

// const hiyuki_foreclaimed_skill_1_cancel_with_swap

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
  maxStacks: 2,
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
    endState: 'AIR',
    requiredForms: ['Foreclaimed Self']
  },
  offtune: 4 * 0.12,
  groupName: 'Foreclaimed Resonance Skill',
  variantName: 'Jade Cleave',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S2: Restore an additional 50 Frostheart for the next 2 casts of Jade Cleave or Petalfall.
    // Each cast consumes 1 s2_frostheart_token (max 2) to grant the bonus.
    const hasToken = owner.sequence >= 2 && (prevSnapshot?.charactersEnergies[characterName]?.s2_frostheart_token ?? 0) >= 1
    // S4: +20% DMG for all team for 30s; HEAL_PROC tag.
    const s4Active = owner.sequence >= 4
    const s4Tags = s4Active ? [...(this.tags ?? []), 'HEAL_PROC' as const] : this.tags
    const s4Modifiers = s4Active ? [...this.damageModifiers, hiyuki_s4_skill_buff] : this.damageModifiers
    // S5: DMG Multiplier increased by 80%.
    const s5Multiplier = owner.sequence >= 5 ? 1.8 : 1
    if (!hasToken) return { ...this, tags: s4Tags, damageModifiers: s4Modifiers, multiplier: this.multiplier * s5Multiplier, resolveVariant: undefined }
    return {
      ...this,
      tags: s4Tags,
      damageModifiers: s4Modifiers,
      multiplier: this.multiplier * s5Multiplier,
      energyGenerated: [
        ...this.energyGenerated,
        { energyType: 'frostheart' as const, amount: 50, share: 0 },
      ],
      energyCost: [
        ...this.energyCost,
        { energyType: 's2_frostheart_token' as const, amount: 1 },
      ],
      resolveVariant: undefined,
    }
  },
}

// ========== Foreclaimed Self: Resonance Skill 2 ==============================================================================
// TODO: Try cancel with dodge

// const hiyuki_foreclaimed_skill_2_cancel_with_swap

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
  maxStacks: 2,
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
    endState: 'GROUND',
    requiredForms: ['Foreclaimed Self']
  },
  offtune: 4 * 0.11 + 0.11,
  groupName: 'Foreclaimed Resonance Skill',
  variantName: 'Petalfall',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S2: Restore an additional 50 Frostheart for the next 2 casts of Jade Cleave or Petalfall.
    // Each cast consumes 1 s2_frostheart_token (max 2) to grant the bonus.
    const hasToken = owner.sequence >= 2 && (prevSnapshot?.charactersEnergies[characterName]?.s2_frostheart_token ?? 0) >= 1
    // S4: +20% DMG for all team for 30s; HEAL_PROC tag.
    const s4Active = owner.sequence >= 4
    const s4Tags = s4Active ? [...(this.tags ?? []), 'HEAL_PROC' as const] : this.tags
    const s4Modifiers = s4Active ? [...this.damageModifiers, hiyuki_s4_skill_buff] : this.damageModifiers
    // S5: DMG Multiplier increased by 80%.
    const s5Multiplier = owner.sequence >= 5 ? 1.8 : 1
    if (!hasToken) return { ...this, tags: s4Tags, damageModifiers: s4Modifiers, multiplier: this.multiplier * s5Multiplier, resolveVariant: undefined }
    return {
      ...this,
      tags: s4Tags,
      damageModifiers: s4Modifiers,
      multiplier: this.multiplier * s5Multiplier,
      energyGenerated: [
        ...this.energyGenerated,
        { energyType: 'frostheart' as const, amount: 50, share: 0 },
      ],
      energyCost: [
        ...this.energyCost,
        { energyType: 's2_frostheart_token' as const, amount: 1 },
      ],
      resolveVariant: undefined,
    }
  },
}

// ========== Foreclaimed Self: Resonance Skill 2 ==============================================================================

// const hiyuki_foreclaimed_iai_cancel_with_swap

// TODO Fastest cast is dodge animation cancel
const hiyuki_foreclaimed_iai: Action = {
  name: 'Foreclaimed: Iai',
  displayName: 'Iai',
  category: 'Skills',
  castTime: 0.625,
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
    previousActions: [ // TODO Uncertain
      { name: 'Foreclaimed: Iai' } as Action,
      hiyuki_foreclaimed_BA_1_5,
      hiyuki_foreclaimed_midair_plunge,
      hiyuki_foreclaimed_skill_1,
      hiyuki_foreclaimed_skill_2,
    ]
  },
  offtune: 1.84,
  resolveVariant(prevSnapshot, characterName, owner) {
    const energies = prevSnapshot?.charactersEnergies[characterName]
    const frosthardenIai = energies?.frostharden_iai ?? 0
    // S2: Iai's DMG Multiplier is increased by 140%.
    const s2Multiplier = owner.sequence >= 2 ? 2.4 : 1

    if (frosthardenIai > 0) {
      return {
        ...this,
        tags: ['GLACIO_CHAFE_APPLIER'],
        multiplier: this.multiplier * s2Multiplier,
        energyGenerated: [
          ...this.energyGenerated.map(e => ({ ...e, amount: e.amount })),
          { energyType: 'whiteout_bitterfrost' as const, amount: 1, share: 0 },
        ],
        energyCost: [
          ...this.energyCost,
          { energyType: 'frostharden_iai' as const, amount: 1 },
        ],
        statusModifications: [
          ...this.statusModifications,
          { type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: 3 },
        ],
        offtune: this.offtune * 2,
        resolveVariant: undefined,
      }
    }
    return { ...this, multiplier: this.multiplier * s2Multiplier, resolveVariant: undefined }
  }
}

// ========== Foreclaimed Self: Liberation =====================================================================================
const hiyuki_foreclaimed_liberation: Action = {
  tags: ['LIBERATION'],
  name: 'Foreclaimed: Liberation',
  displayName: 'Foreclaiming: Blade Liberation',
  category: 'Skills',
  castTime: 1.00, // TODO
  multiplier: (99.41 + 397.62) / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 25,
  energyGenerated: [
    { energyType: 'concerto', amount: 20, share: 0 }
  ],
  energyCost: [
    { energyType: 'energy', amount: 125 }
  ],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Foreclaimed Self']
  },
  offtune: 0, // TODO data claimed it was 0
  formChange: 'Present Self',
  resolveVariant(prevSnapshot, characterName, owner) {
    const energies = prevSnapshot?.charactersEnergies[characterName]
    const snowforged_blade = energies?.snowforged_blade ?? 0
    // S6: DMG Multiplier of Foreclaiming: Blade Liberation is increased by 150%.
    const s6Multiplier = owner.sequence >= 6 ? 2.5 : 1
    if (snowforged_blade == 0) {
      return {
        ...this,
        multiplier: this.multiplier * s6Multiplier,
        energyCost: [
          { energyType: 'energy', amount: 125 },
          { energyType: 'snowforged_blade', amount: 0 }
        ],
        resolveVariant: undefined }
      } if (snowforged_blade == 1){
      return {
        ...this,
        energyCost: [
          { energyType: 'energy', amount: 125 },
          { energyType: 'snowforged_blade', amount: 1 }
        ],
        multiplier: (1292.28) / 100 * s6Multiplier,
        resolveVariant: undefined }
    } if (snowforged_blade == 2) {
      return {
        ...this,
        energyCost: [
          { energyType: 'energy', amount: 125 },
          { energyType: 'snowforged_blade', amount: 2 }
        ],
        multiplier: (2087.52) / 100 * s6Multiplier,
        resolveVariant: undefined }
    } else {
      return {
        ...this,
        energyCost: [
          { energyType: 'energy', amount: 125 },
          { energyType: 'snowforged_blade', amount: 3 }
        ],
        multiplier: (2882.75) / 100 * s6Multiplier,
        resolveVariant: undefined }
    }
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
    { energyType: 'dedication', amount: 100, share: 0 }
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
  resolveVariant(prevSnapshot, characterName) {
    const form = prevSnapshot?.charactersForms[characterName] ?? ''
    const inForeclaimedSelf = form === 'Foreclaimed Self'

    if (inForeclaimedSelf) {
      return {
        ...this,
        energyGenerated: this.energyGenerated.filter(e => e.energyType !== 'dedication'),
        comboChainTags: ['FORECLAIMED_BA1'],
        resolveVariant: undefined,
      }
    }

    return { ...this, resolveVariant: undefined }
  }
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

const hiyuki_wait_100: Action = {
  name: 'Wait 100s',
  displayName: 'Wait 100s',
  category: 'Other',
  castTime: 100,
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

export const hiyuki_intro_outro_actions = [hiyuki_intro, hiyuki_outro]

export const all_actions = [
  hiyuki_skill,
  hiyuki_skill_cancel_with_swap,

  hiyuki_BA_3_enhanced,
  hiyuki_BA_3_enhanced_cancel_with_swap,
  hiyuki_heavy_attack_enhanced,
  hiyuki_heavy_attack_enhanced_cancel_with_swap,
  hiyuki_liberation,
  hiyuki_foreclaimed_BA_1_5,
  hiyuki_foreclaimed_BA_1_5_cancel_with_swap,
  hiyuki_foreclaimed_midair_1_2,
  hiyuki_foreclaimed_midair_plunge,
  hiyuki_foreclaimed_enhanced_heavy_attack,
  hiyuki_foreclaimed_skill_1,
  hiyuki_foreclaimed_skill_2,
  hiyuki_foreclaimed_iai,
  hiyuki_foreclaimed_liberation,

  ...hiyuki_intro_outro_actions,
  hiyuki_wait_005,
  hiyuki_wait_1,
  hiyuki_wait_100,
  hiyuki_wait_for_swap,
  hiyuki_energy,
  hiyuki_concerto
]

export {

  // Intro / Outro
  hiyuki_intro,
  hiyuki_outro,

  // Swaps
  hiyuki_wait_005,
  hiyuki_wait_1,
  hiyuki_wait_100,
  hiyuki_wait_for_swap,

  // Testing
  hiyuki_energy,
  hiyuki_concerto
}

