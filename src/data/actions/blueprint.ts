// ========== Blueprint =======================================================================================================

export const XXX = {
  name: 'XXX',
  displayName: 'XXX',
  castTime: 0,
  multipliers: [],
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,

  castConditions: {
    position: 'GROUND',
    previousAction: '',
    endState: 'GROUND',
  },

  energiesGenerated: [
    [
      { energyType: 'energy', amount: 999, share: 0.5, scalingStat: 'energyPercent' },
      { energyType: 'concerto', amount: 999, share: 0 },
      { energyType: 'forte', amount: 999, share: 0 },
    ],
  ],
  energiesCost: [],

  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],

  other: {
    hardness: [999],
    toughness: [999],
    offtune: [999],
  },
}
