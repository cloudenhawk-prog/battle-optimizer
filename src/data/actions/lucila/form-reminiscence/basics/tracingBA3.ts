import type { Action } from '../../../../../types/action'
import * as values from '../../values'
import { lucila_oblivion } from '../../../../sideEffects/sideEffects'

// Tracing BA Stage 3: deals 47.87% × 8 Glacio Basic ATK DMG.
// When cast, reads current Traces from the snapshot and converts floor(traces / 50) into Photos.
// Each Photo consumed:
//   - fires Oblivion once (285.48% Basic ATK DMG + 1 Glacio Chafe stack)
//   - restores +5 Concerto and +2 Film Roll (via resolveVariant energyGenerated)
//   - costs 50 Traces
const lucila_tracingBA3: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Tracing Forms 3',
  displayName: 'Tracing Forms: Stage 3',
  category: 'Basics',
  castTime: values.tracingBA3_castTime,
  multiplier: values.tracingBA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.tracingBA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.tracingBA3_concerto, share: 0 },
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
    requiredComboTags: ['Tracing2'],
  },
  comboChainTags: ['Tracing3'],
  hideWhenNotCastable: true,
  offtune: values.tracingBA3_offtune,
  groupName: 'Tracing Forms 3',
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
        // 1 Glacio Chafe per Oblivion cast (applicationCount so teamActionTriggers fire correctly)
        { type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: photos, applicationCount: photos },
      ],
      // Push lucila_oblivion once per photo consumed
      sideEffects: Array(photos).fill(lucila_oblivion),
      resolveVariant: undefined,
    }
  },
}

export { lucila_tracingBA3 }
