import type { Action } from '../../../../../types/action'
import * as values from '../../values'
import { liberation_s6_crit_dmg } from '../../../../modifiers/hiyuki'

// Default
const hiyuki_liberation: Action = {
  tags: ['LIBERATION', 'GLACIO_CHAFE_APPLIER'],
  name: 'Liberation',
  displayName: 'Foreclaiming: Inward Vision',
  category: 'Skills',
  castTime: values.cast_time_Ult1,
  multiplier: values.liberation_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: values.liberation_cooldown,
  energyGenerated: [
    { energyType: 'concerto', amount: values.liberation_concerto, share: 0 },
    { energyType: 'frostharden_iai', amount: values.liberation_frostharden_iai, share: 0 },
    { energyType: 'frostheart', amount: values.liberation_frostheart, share: 0 }
  ],
  energyCost: [
    { energyType: 'foreclaiming', amount: values.liberation_cost_foreclaiming }
  ],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.liberation_glacio_chafe_stacks, applicationCount: 4 }],
  damageModifiers: [],
  inherentModifiers: [liberation_s6_crit_dmg],
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
    if (owner.sequence >= 1) {
      return {
        ...this,
        energyGenerated: [
          ...this.energyGenerated,
          { energyType: 's1_enhanced_ba1' as const, amount: 1, share: 0 },
          { energyType: 's1_enhanced_ba2' as const, amount: 1, share: 0 },
        ],
        resolveVariant: undefined,
      }
    }
    return { ...this, resolveVariant: undefined }
  },
}

export {
  hiyuki_liberation,
}