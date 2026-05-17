import type { Action } from '../../../../../types/action'
import * as values from '../../values'
import { lucila_oblivion } from '../../../../sideEffects/sideEffects'

const lucila_tracingBA2: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Tracing Forms 2',
  displayName: 'Tracing Forms: Stage 2',
  category: 'Basics',
  castTime: values.tracingBA2_castTime,
  multiplier: values.tracingBA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.tracingBA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.tracingBA2_concerto, share: 0 },
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
    blockedComboTags: ['Tracing Block', 'Tracing2', 'Tracing3'],
    requiredComboTags: ['Tracing1'],
  },
  comboChainTags: ['Tracing Block'],
  hideWhenNotCastable: true,
  offtune: values.tracingBA2_offtune,
  groupName: 'Tracing Forms 2',
  variantName: 'Default',
}

// ========== Tracing2-3 =======================================================================================================

const lucila_tracingBA2_3: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Tracing Forms 2-3',
  displayName: 'Tracing Forms: Stage 2-3',
  category: 'Basics',
  castTime: values.tracingBA2_castTime + values.tracingBA3_castTime,
  multiplier: values.tracingBA2_multiplier + values.tracingBA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.tracingBA2_energy + values.tracingBA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.tracingBA2_concerto + values.tracingBA3_concerto, share: 0 },
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
    blockedComboTags: ['Tracing Block', 'Tracing2', 'Tracing3'],
    requiredComboTags: ['Tracing1'],
  },
  comboChainTags: ['Tracing3'],
  hideWhenNotCastable: true,
  offtune: values.tracingBA2_offtune + values.tracingBA3_offtune,
  groupName: 'Tracing Forms 2-3',
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

export { lucila_tracingBA2, lucila_tracingBA2_3 }
