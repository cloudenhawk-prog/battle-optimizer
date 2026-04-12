import type { Action } from '../../../../types/action'
import { outro_buff } from '../../../modifiers/hiyuki'

// Intro
const hiyuki_intro: Action = {
  tags: ['INTRO_ACTION', 'GLACIO_CHAFE_APPLIER'],
  name: 'Hiyuki Intro',
  displayName: 'Frostedge',
  category: 'Other',
  castTime: 1.0, // TODO
  multiplier: (156.15) / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'dedication', amount: 200, share: 0 }
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND',
  },
  offtune: 0.898,
  resolveVariant(prevSnapshot, characterName) {
    const form = prevSnapshot?.charactersForms[characterName] ?? ''
    const inForeclaimedSelf = form === 'Foreclaimed Self'

    if (inForeclaimedSelf) {
      return {
        ...this,
        energyGenerated: this.energyGenerated.filter(e => e.energyType !== 'dedication'),
        comboChainTags: ['Foreclaiming BA1'],
        resolveVariant: undefined,
      }
    }

    return { ...this, resolveVariant: undefined }
  }
}

// Outro
const hiyuki_outro: Action = {
  tags: ['OUTRO_ACTION'],
  name: 'Outro',
  displayName: 'Snowlight Blessing',
  category: 'Other',
  castTime: 0,
  multiplier: 0,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['OUTRO'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [outro_buff],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

export {
  hiyuki_intro,
  hiyuki_outro,
}
