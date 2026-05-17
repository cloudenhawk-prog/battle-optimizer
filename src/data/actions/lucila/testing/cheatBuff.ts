import type { Action } from '../../../../types/action'
import { always } from '../../../../utils/conditions/damageModifierConditions'

const lucila_cheat_buff: Action = {
  tags: ['SKILL'],
  name: 'Cheat Buff',
  displayName: 'Cheat Buff',
  category: 'Testing',
  castTime: 0,
  multiplier: 0.0001,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Lucila Cheat Buff',
      displayName: 'Lucila Cheat Buff',
      type: 'buff',
      color: '#6EC1F2',
      ownerCharacter: null,
      characterStats: {
        // 12 % glacio from outro from Glommoth
        glacioBonusDMG: 0.25,
        glacioChafeBonusDMG: 0.60,
        bonusATK: 0.24
      },
      enemyStats: { 
        glacioRES: -0.08,
      },
      condition: always(),
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 1000 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0
}

export {
  lucila_cheat_buff
}
