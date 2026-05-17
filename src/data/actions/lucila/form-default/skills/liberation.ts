import type { Action } from '../../../../../types/action'
import * as values from '../../values'
import { liberation_ba_dmg_buff } from '../../../../modifiers/lucila'

// Clear As Day — Resonance Liberation.
// In Resonance Mode - Glacio Chafe, this is considered as Basic Attack DMG.
// Casting this skill: increases Lucila's Basic Attack DMG Bonus by 30% for 10s (self buff)
// and grants 4 Film Roll stacks (Memory Palace forte circuit).
// Entering Reminiscence: replaces basic attacks, dodge counter, intro skill for the form.
const lucila_liberation: Action = {
  tags: ['LIBERATION'],
  name: 'Liberation',
  displayName: 'Clear As Day',
  category: 'Skills',
  castTime: values.liberation_castTime,
  multiplier: values.liberation_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'], // Considered as Basic Attack DMG in Glacio Chafe mode
  cooldown: values.liberation_cooldown,
  energyGenerated: [
    { energyType: 'concerto', amount: values.liberation_concerto, share: 0 },
    { energyType: 'film_roll', amount: values.liberation_film_roll, share: 0 },
  ],
  energyCost: [
    { energyType: 'energy', amount: values.liberation_energy_cost },
  ],
  statusModifications: [],
  damageModifiers: [liberation_ba_dmg_buff],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND',
    requiredForms: ['Default Form'],
  },
  offtune: values.liberation_offtune,
  groupName: 'Liberation',
  variantName: 'Default',
  formChange: 'Reminiscence',
}

export { lucila_liberation }
