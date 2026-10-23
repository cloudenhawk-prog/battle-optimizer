// Mornye — Wide Field Observation Mode: Heavy Attack, spends Relative Momentum and applies Interfered Marker.
import type { Action } from '../../../../../types/action'
import { ownerAtLeast } from '../../../../helpers/modifierConditions'

// ========== Mode: Heavy Attack ===============================================================================================
export const mode_mornye_heavy: Action = {
  tags: ['HEAVY_ATTACK'],
  name: 'Mode: Heavy Attack',
  displayName: 'Mode: Heavy Attack',
  category: 'Basics',
  castTime: 1.32,
  multiplier: (258.46) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3.25, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 11.96, share: 0 }
  ],
  energyCost: [{ energyType: 'relative_momentum', amount: 100 }],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Mornye: Interfered Marker',
      displayName: 'Interfered Marker',
      type: 'buff',
      color: '#B87EFF',
      ownerCharacter: 'Mornye',
      characterStats: { bonusDMG: 0 },
      // Stats are fixed at activation from Mornye's Energy Regen above 100% (capped at 160 points).
      statsOnActivation: (ctx) => {
        const mornye = ctx.character.name === 'Mornye' ? ctx.character : ctx.allies.find(c => c.name === 'Mornye')
        const excess = Math.min(Math.max(0, ((mornye?.stats.energyPercent ?? 1) - 1) * 100), 160)
        return { bonusDMG: excess * 0.0025 }
      },
      condition: ownerAtLeast('Mornye', 1),
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      description: 'For 20 seconds: Every 1 % of Mornye\'s Energy Regen over 100 % grants 0.25% Damage Bonus to all Resonators, up to 40%.',
      showStats: true
    },
    {
      source: 'Mornye: Interfered Marker (S2)',
      displayName: 'Interfered Marker (S2)',
      type: 'buff',
      color: '#B87EFF',
      ownerCharacter: 'Mornye',
      characterStats: { critDamage: 0 },
      // Stats are fixed at activation from Mornye's Energy Regen above 100% (capped at 160 points).
      statsOnActivation: (ctx) => {
        const mornye = ctx.character.name === 'Mornye' ? ctx.character : ctx.allies.find(c => c.name === 'Mornye')
        const excess = Math.min(Math.max(0, ((mornye?.stats.energyPercent ?? 1) - 1) * 100), 160)
        return { critDamage: excess * 0.002 }
      },
      condition: ownerAtLeast('Mornye', 2),
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      description: 'For 20 seconds: Every 1 % of Mornye\'s Energy Regen over 100 % grants 0.2% Crit DMG to all Resonators, up to 32%.',
      showStats: true
    },
  ],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
    preventsSwapOut: true,
    requiredForms: ['Wide Field Observation Mode']
  },
  offtune: 1.04,
  attemptFollowUp: { actionName: 'Liberation', must: true },
}
