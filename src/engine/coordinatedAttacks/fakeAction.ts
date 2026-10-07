// Wraps a CoordinatedAttack in an Action-shaped object so calculateDamage can be reused for its hits.
import type { CoordinatedAttack } from '../../types/coordinatedAttack'
import type { Action } from '../../types/action'

// ========== Fake Action Builder =============================================================================================

/**
 * Wraps a CoordinatedAttack definition in an Action-shaped object so that the existing
 * calculateDamage pipeline (which consumes Action) can be reused without modification.
 * Only the fields actually read by calculateDamage (scaling, multiplier, elements, dmgTypes,
 * name) are meaningful; all other fields carry safe empty/zero defaults.
 */
export function makeActionFromCoordinatedAttack(ca: CoordinatedAttack): Action {
  return {
    name: ca.name,
    displayName: ca.displayName ?? ca.name,
    category: 'Other',
    castTime: 0,
    multiplier: ca.multiplier,
    scaling: ca.scaling,
    elements: ca.elements,
    dmgTypes: ca.dmgTypes,
    cooldown: 0,
    energyGenerated: [],
    energyCost: [],
    statusModifications: [],
    damageModifiers: ca.damageModifiers ?? [],
    sideEffects: [],
    coordinatedAttacks: [],
    castConditions: { startState: 'ANY', endState: 'ANY' },
    offtune: 0,
  }
}
