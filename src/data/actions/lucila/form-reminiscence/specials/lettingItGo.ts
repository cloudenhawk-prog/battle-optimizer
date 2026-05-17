import type { Action } from '../../../../../types/action'
import * as values from '../../values'

// Letting It Go — fires at the end of BA Tracing Forms Stage 3 automatically (or triggered).
// In Glacio Chafe mode, considered as Basic Attack DMG.
// Casting this action ends Reminiscence form (returns to Default Form).
// Resonator switching is disabled while casting. Immune to interruption.
const lucila_lettingItGo: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Letting It Go',
  displayName: 'Letting It Go',
  category: 'Skills',
  castTime: values.lettingItGo_castTime,
  multiplier: values.lettingItGo_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'], // Considered as Basic Attack DMG in Glacio Chafe mode
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.lettingItGo_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.lettingItGo_concerto, share: 0 },
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
    requiredComboTags: ['Tracing3'],
  },
  offtune: values.lettingItGo_offtune,
  groupName: 'Letting It Go',
  variantName: 'Default',
  formChange: 'Default Form',
}

export { lucila_lettingItGo }
