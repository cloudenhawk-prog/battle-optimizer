import type { Action } from '../../../../../types/action'
import { liberation_s6_crit_dmg } from '../../../../modifiers/hiyuki'
import { loadSettings } from '../../../../../hooks/useSettings'
import * as values from '../../values'

const hiyuki_foreclaimed_liberation: Action = {
  tags: ['LIBERATION'],
  name: 'Foreclaimed: Liberation',
  displayName: 'Foreclaiming: Blade Liberation',
  category: 'Skills',
  castTime: values.cast_time_Ult2,
  multiplier: (198.81 + 795.24) / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 25,
  energyGenerated: [
    { energyType: 'concerto', amount: 20, share: 0 }
  ],
  energyCost: [
    { energyType: 'energy', amount: 125 }
  ],
  statusModifications: [],
  damageModifiers: [],
  inherentModifiers: [liberation_s6_crit_dmg],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Foreclaimed Self']
  },
  offtune: 0, // TODO data claimed it was 0
  formChange: 'Present Self',
  resolveVariant(prevSnapshot, characterName) {
    const energies = prevSnapshot?.charactersEnergies[characterName]
    const { useFixedStacks } = loadSettings()
    const snowforged_blade = useFixedStacks ? 1.5 : (energies?.snowforged_blade ?? 0)

    return {
      ...this,
      multiplier: this.multiplier + snowforged_blade * (795.24 / 100),
      energyCost: [
        { energyType: 'energy', amount: 125 },
        { energyType: 'snowforged_blade', amount: snowforged_blade }
      ]
    }
  }
}

export {
  hiyuki_foreclaimed_liberation
}
