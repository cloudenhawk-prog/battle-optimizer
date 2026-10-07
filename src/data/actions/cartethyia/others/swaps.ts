// Cartethyia — utility wait actions (fixed 0.05s, until next swap, until next cooldown).
import type { Action } from '../../../../types/action'

// ========== Swaps ============================================================================================================
export const cartethyia_wait_005: Action = {
  name: 'Wait 0.05s',
  displayName: 'Wait 0.05s',
  category: 'Testing',
  castTime: 0.05,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [],
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

export const cartethyia_wait_for_swap: Action = {
  name: 'Wait Until Next Swap Is Available',
  displayName: 'Wait Until Next Swap Is Available',
  category: 'Other',
  castTime: 0, // resolved dynamically via resolveVariant
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
    customCanCast(prevSnapshot) {
      if (!prevSnapshot) return false
      const cooldowns = prevSnapshot.charactersSwapCooldownUntil ?? {}
      return Object.values(cooldowns).some(until => until - prevSnapshot.toTime > 0)
    },
  },
  offtune: 0,
  // castTime = time until the earliest character swap cooldown expires.
  resolveVariant(prevSnapshot) {
    const cooldowns = prevSnapshot?.charactersSwapCooldownUntil ?? {}
    const toTime = prevSnapshot?.toTime ?? 0
    const remaining = Object.values(cooldowns)
      .map(until => until - toTime)
      .filter(r => r > 0)
    const castTime = remaining.length > 0 ? Math.min(...remaining) : 0
    return { ...this, castTime, resolveVariant: undefined }
  },
}

export const cartethyia_wait_for_cooldown: Action = {
  name: 'Wait Until Next Cooldown',
  displayName: 'Wait Until Next Cooldown',
  category: 'Other',
  castTime: 0, // resolved dynamically via resolveVariant
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
    customCanCast(prevSnapshot, characterName) {
      if (!prevSnapshot || !characterName) return false
      const cooldowns = prevSnapshot.charactersCooldowns?.[characterName] ?? {}
      return Object.values(cooldowns).some(remaining => remaining > 0)
    },
  },
  offtune: 0,
  // castTime = time until this character's shortest running cooldown expires.
  resolveVariant(prevSnapshot, characterName) {
    const cooldowns = prevSnapshot?.charactersCooldowns?.[characterName] ?? {}
    const remaining = Object.values(cooldowns).filter(r => r > 0)
    const castTime = remaining.length > 0 ? Math.min(...remaining) : 0
    return { ...this, castTime, resolveVariant: undefined }
  }
}
