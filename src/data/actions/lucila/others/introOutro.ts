import type { Action } from '../../../../types/action'
import * as values from '../values'
import { montage_outro_buff } from '../../../modifiers/lucila'

// Intro: Clip It (Default Form) / Clip It: Hard Cut (Reminiscence Form)
// Both forms apply 1 Glacio Chafe and restore 100 Traces (= 2 photos conceptually).
// resolveVariant picks the correct multiplier, energy, and cast time based on the current form.
const lucila_intro: Action = {
  tags: ['INTRO_ACTION', 'GLACIO_CHAFE_APPLIER'],
  name: 'Lucila Intro',
  displayName: 'Clip It',
  category: 'Other',
  castTime: values.clipIt_castTime,
  multiplier: values.clipIt_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.clipIt_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.clipIt_concerto, share: 0 },
    { energyType: 'traces', amount: values.clipIt_traces, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND',
  },
  offtune: values.clipIt_offtune,
  resolveVariant(prevSnapshot, characterName) {
    const form = prevSnapshot?.charactersForms[characterName] ?? ''
    const inReminiscence = form === 'Reminiscence'

    if (inReminiscence) {
      return {
        ...this,
        displayName: 'Clip It: Hard Cut',
        castTime: values.clipItHardCut_castTime,
        multiplier: values.clipItHardCut_multiplier,
        energyGenerated: [
          { energyType: 'energy', amount: values.clipItHardCut_energy, share: 0.5, scalingStat: 'energyPercent' as const },
          { energyType: 'concerto', amount: values.clipItHardCut_concerto, share: 0 },
          { energyType: 'traces', amount: values.clipItHardCut_traces, share: 0 },
        ],
        offtune: values.clipItHardCut_offtune,
        resolveVariant: undefined,
      }
    }

    return { ...this, resolveVariant: undefined }
  },
}

// Outro: Montage — grants the whole team +60% Glacio Chafe DMG Bonus for 30s.
const lucila_outro: Action = {
  tags: ['OUTRO_ACTION'],
  name: 'Outro',
  displayName: 'Montage',
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
  damageModifiers: [montage_outro_buff],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

export {
  lucila_intro,
  lucila_outro,
}

