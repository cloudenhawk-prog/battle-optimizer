import type { Action } from '../../../../types/action'
import type { EnergyType } from '../../../../types/baseTypes'

function makeEnergyUpAction(energyType: EnergyType, displayName: string): Action {
  return {
    name: `${displayName} Up`,
    displayName: `${displayName} Up`,
    category: 'Testing',
    castTime: 0,
    multiplier: 0,
    scaling: 'ATK',
    elements: [''],
    dmgTypes: [''],
    cooldown: 0,
    energyGenerated: [{ energyType, amount: 1000, share: 0 }],
    energyCost: [],
    statusModifications: [],
    damageModifiers: [],
    sideEffects: [],
    castConditions: {
      startState: 'ANY',
      endState: 'PRESERVE',
    },
    offtune: 0,
  }
}

const lucila_energy               = makeEnergyUpAction('energy',                'Energy')
const lucila_concerto             = makeEnergyUpAction('concerto',              'Concerto')

export {
  lucila_energy,
  lucila_concerto
}
