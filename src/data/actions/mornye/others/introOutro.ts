// Mornye — Intro "Convergence" (enters Wide Field Observation Mode) and Outro "Recursion".
import type { Action } from '../../../../types/action'
import { always } from '../../../helpers/modifierConditions'
import { syntony_field, syntony_field_s2 } from '../../../modifiers/mornye'

// ========== Intro & Outro ====================================================================================================
export const mornye_intro: Action = {
  tags: ['INTRO_ACTION', 'HEAL_PROC'],
  name: 'Mornye Intro',
  displayName: 'Convergence',
  category: 'Other',
  castTime: 1.7,
  multiplier: (202.79) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [syntony_field, syntony_field_s2],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'AIR',
  },
  offtune: 1.36,
  formChange: 'Wide Field Observation Mode',
  // Same once-per-20s bonus Concerto trick as Mode: Basic Attack 1-3 (cooldown key = this action).
  resolveVariant(prevSnapshot, characterName) {
    const bonusOnCooldown = (prevSnapshot?.charactersCooldowns?.[characterName]?.['Mornye Intro'] ?? 0) > 0
    if (bonusOnCooldown) return { ...this, resolveVariant: undefined }
    return {
      ...this,
      cooldown: 20,
      energyGenerated: [
        ...this.energyGenerated,
        { energyType: 'concerto', amount: 20, share: 0 },
      ],
      resolveVariant: undefined,
    }
  },
}

export const mornye_outro: Action = {
  tags: ['OUTRO_ACTION'],
  name: 'Outro',
  displayName: 'Recursion',
  category: 'Other',
  castTime: 0,
  multiplier: 0,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['OUTRO'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Mornye Outro Buff',
      displayName: 'Recursion',
      type: 'buff',
      ownerCharacter: 'Mornye',
      characterStats: { amplifyDMG: 0.25 },
      condition: always(),
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      color: '#FFD700',
      description: 'For 30 seconds: all Resonators gain 25% All DMG Amplification.',
      showStats: true
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}
