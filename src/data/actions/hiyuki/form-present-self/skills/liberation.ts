import type { Action } from '../../../../../types/action'
import * as values from '../../values'

// Default
const hiyuki_liberation: Action = {
  tags: ['LIBERATION', 'GLACIO_CHAFE_APPLIER'],
  name: 'Liberation',
  displayName: 'Foreclaiming: Inward Vision',
  category: 'Skills',
  castTime: 1.00, // TODO
  multiplier: values.liberation_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: values.liberation_cooldown,
  energyGenerated: [
    { energyType: 'concerto', amount: values.liberation_concerto, share: 0 },
    { energyType: 'frostharden_iai', amount: values.liberation_frostharden_iai, share: 0 }
  ],
  energyCost: [
    { energyType: 'foreclaiming', amount: values.liberation_cost_foreclaiming }
  ],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.liberation_glacio_chafe_stacks }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Present Self']
  },
  offtune: values.liberation_offtune,
  formChange: 'Foreclaimed Self',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: Casting this action enhances the next Basic Attack 1-5 so that BA1 & BA2 also apply
    // Glacio Chafe. Grant one-shot s1_enhanced_ba1 and s1_enhanced_ba2 tokens consumed by hiyuki_foreclaimed_BA_1_5.
    // S6: DMG Multiplier of Foreclaiming: Inward Vision is increased by 30%.
    const s6Multiplier = owner.sequence >= 6 ? 1.3 : 1
    if (owner.sequence >= 1) {
      return {
        ...this,
        multiplier: this.multiplier * s6Multiplier,
        energyGenerated: [
          ...this.energyGenerated,
          { energyType: 's1_enhanced_ba1' as const, amount: 1, share: 0 },
          { energyType: 's1_enhanced_ba2' as const, amount: 1, share: 0 },
        ],
        resolveVariant: undefined,
      }
    }
    return { ...this, multiplier: this.multiplier * s6Multiplier, resolveVariant: undefined }
  },
}

export {
  hiyuki_liberation,
}