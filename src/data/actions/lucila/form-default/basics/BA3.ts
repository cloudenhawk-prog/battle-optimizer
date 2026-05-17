import type { Action } from '../../../../../types/action'
import * as values from '../../values'

// BA Stage 3 - Commendable: restores 50 Traces (= 1 photo) and deals increased Glacio DMG.
// We only model Commendable (not Unremarkable) as per the kit notes.
const lucila_BA3: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 3',
  displayName: 'Snapshot: Stage 3 (Commendable)',
  category: 'Basics',
  castTime: values.BA3_castTime,
  multiplier: values.BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA3_concerto, share: 0 },
    { energyType: 'traces', amount: values.BA3_traces, share: 0 },
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
    requiredForms: ['Default Form'],
    requiredComboTags: ['BA2'],
  },
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  offtune: values.BA3_offtune,
  groupName: 'Basic Attack 3',
  variantName: 'Default',
}

export { lucila_BA3 }
