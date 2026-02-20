import type { SideEffect } from '../types/sideEffect'
import { calculateAeroErosionSideEffectDamage } from '../utils/calculators/sideEffectCalculators'
import { removeNegativeStatusStacks } from '../utils/modifications/statusModificationHelpers'

// ========== Side Effects =====================================================================================================

// TODO: Have the removal amount of damage triggers be optional arguments
export const aeroErosionExplosion: SideEffect = {
  name: 'Aero Erosion Explosion',
  damageDealt: calculateAeroErosionSideEffectDamage,
  statusModifications: [removeNegativeStatusStacks('Aero Erosion', 1)],
}
