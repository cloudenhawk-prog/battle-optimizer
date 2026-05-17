import type { Action } from '../../../../../types/action'
import * as values from '../../values'
import { lucila_oblivion } from '../../../../sideEffects/sideEffects'

const lucila_tracingBA1: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Tracing Forms 1',
  displayName: 'Tracing Forms: Stage 1',
  category: 'Basics',
  castTime: values.tracingBA1_castTime,
  multiplier: values.tracingBA1_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.tracingBA1_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.tracingBA1_concerto, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Reminiscence'],
    blockedComboTags: ['Tracing Block', 'Tracing1', 'Tracing2'],
  },
  comboChainTags: ['Tracing Block'],
  hideWhenNotCastable: true,
  offtune: values.tracingBA1_offtune,
  groupName: 'Tracing Forms 1',
  variantName: 'Default',
}

// ========== Tracing1-2 =======================================================================================================

const lucila_tracingBA1_2: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Tracing Forms 1-2',
  displayName: 'Tracing Forms: Stage 1-2',
  category: 'Basics',
  castTime: values.tracingBA1_castTime + values.tracingBA2_castTime,
  multiplier: values.tracingBA1_multiplier + values.tracingBA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.tracingBA1_energy + values.tracingBA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.tracingBA1_concerto + values.tracingBA2_concerto, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Reminiscence'],
    blockedComboTags: ['Tracing Block', 'Tracing1', 'Tracing2'],
  },
  comboChainTags: ['Tracing Block'],
  hideWhenNotCastable: true,
  offtune: values.tracingBA1_offtune + values.tracingBA2_offtune,
  groupName: 'Tracing Forms 1-2',
  variantName: 'Default',
}

// ========== Tracing1-3 =======================================================================================================

const lucila_tracingBA1_3: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Tracing Forms 1-3',
  displayName: 'Tracing Forms: Stage 1-3',
  category: 'Basics',
  castTime: values.tracingBA1_castTime + values.tracingBA2_castTime + values.tracingBA3_castTime,
  multiplier: values.tracingBA1_multiplier + values.tracingBA2_multiplier + values.tracingBA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.tracingBA1_energy + values.tracingBA2_energy + values.tracingBA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.tracingBA1_concerto + values.tracingBA2_concerto + values.tracingBA3_concerto, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Reminiscence'],
    blockedComboTags: ['Tracing Block', 'Tracing1', 'Tracing2'],
  },
  comboChainTags: ['Tracing3'],
  hideWhenNotCastable: true,
  offtune: values.tracingBA1_offtune + values.tracingBA2_offtune + values.tracingBA3_offtune,
  groupName: 'Tracing Forms 1-3',
  variantName: 'Default',
  resolveVariant(prevSnapshot, characterName) {
    const traces = prevSnapshot?.charactersEnergies[characterName]?.traces ?? 0
    const photos = Math.min(Math.floor(traces / 50), 3)

    if (photos === 0) {
      return { ...this, resolveVariant: undefined }
    }

    return {
      ...this,
      energyCost: [{ energyType: 'traces', amount: photos * 50 }],
      energyGenerated: [
        ...this.energyGenerated,
        { energyType: 'concerto', amount: photos * values.oblivion_concerto_per_photo, share: 0 },
        { energyType: 'film_roll', amount: photos * values.oblivion_film_roll_per_photo, share: 0 },
      ],
      statusModifications: [
        { type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: photos, applicationCount: photos },
      ],
      sideEffects: Array(photos).fill(lucila_oblivion),
      resolveVariant: undefined,
    }
  },
}

export { lucila_tracingBA1, lucila_tracingBA1_2, lucila_tracingBA1_3 }
