import type { Action } from "../../../../types/action"

// Wait 0.05s
const hiyuki_wait_005: Action = {
  name: 'Wait 0.05s',
  displayName: 'Wait 0.05s',
  category: 'Other',
  castTime: 0.05,
  multiplier: 0,
  scaling: 'ATK',
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
    preventsSwapOut: true,
  },
  offtune: 0,
}

// Wait until next swap is available
const hiyuki_wait_for_swap: Action = {
  name: 'Wait Until Next Swap Is Available',
  displayName: 'Wait Until Next Swap Is Available',
  category: 'Other',
  castTime: 0,
  multiplier: 0,
  scaling: 'ATK',
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
    swapOutState: 'PRESERVE',
    endState: 'PRESERVE',
    requiresSwapOut: true,
    persistenceTime: 0,
    customCanCast(prevSnapshot) {
      if (!prevSnapshot) return false
      const cooldowns = prevSnapshot.charactersSwapCooldownUntil ?? {}
      return Object.values(cooldowns).some(until => until - prevSnapshot.toTime > 0)
    },
  },
  offtune: 0,
  resolveVariant(prevSnapshot) {
    const cooldowns = prevSnapshot?.charactersSwapCooldownUntil ?? {}
    const toTime = prevSnapshot?.toTime ?? 0
    const remaining = Object.values(cooldowns)
      .map(until => until - toTime)
      .filter(r => r > 0)
    const castTime = remaining.length > 0 ? Math.min(...remaining) : 0
    return { ...this, castTime, resolveVariant: undefined }
  }
}

export {
  hiyuki_wait_005,
  hiyuki_wait_for_swap,
}
