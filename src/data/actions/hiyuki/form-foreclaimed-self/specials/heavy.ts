import type { Action } from '../../../../../types/action'
import * as values from '../../values'

// Default
const hiyuki_foreclaimed_enhanced_heavy_attack: Action = {
  tags: ['HEAVY_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Enhanced Heavy Attack',
  displayName: 'Bitterfrost: Foreclaimed Self',
  category: 'Basics',
  castTime: values.cast_time_UFHA,
  multiplier: values.foreclaimed_enhanced_heavy_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_enhanced_heavy_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_enhanced_heavy_concerto, share: 0 },
    { energyType: 'snowforged_blade', amount: values.foreclaimed_enhanced_heavy_snowforged_blade, share: 0 }
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
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self']
  },
  offtune: values.foreclaimed_enhanced_heavy_offtune,
  hideWhenNotCastable: true,
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S3: Additional +160%
    if (owner.sequence < 3) return { ...this, resolveVariant: undefined }
    return {
      ...this,
      multiplier: this.multiplier * 2.6,
      resolveVariant: undefined,
    }
  }
}

export {
  hiyuki_foreclaimed_enhanced_heavy_attack
}
