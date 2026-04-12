import type { Action } from '../../../../../types/action'

const hiyuki_foreclaimed_liberation: Action = {
  tags: ['LIBERATION'],
  name: 'Foreclaimed: Liberation',
  displayName: 'Foreclaiming: Blade Liberation',
  category: 'Skills',
  castTime: 1.00, // TODO
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
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Foreclaimed Self']
  },
  offtune: 0, // TODO data claimed it was 0
  formChange: 'Present Self',
  resolveVariant(prevSnapshot, characterName, owner) {
    const energies = prevSnapshot?.charactersEnergies[characterName]
    const snowforged_blade = energies?.snowforged_blade ?? 0
    // S6: DMG Multiplier of Foreclaiming: Blade Liberation is increased by 30%.
    const s6Multiplier = owner.sequence >= 6 ? 1.3 : 1

    return {
      ...this,
      multiplier: (this.multiplier + snowforged_blade * (795.24 / 100)) * s6Multiplier,
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
