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
  },
  offtune: 0,
}

// Wait 1s
const hiyuki_wait_1: Action = {
  name: 'Wait 1s',
  displayName: 'Wait 1s',
  category: 'Other',
  castTime: 1,
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
  },
  offtune: 0,
}

// Wait 100s
const hiyuki_wait_100: Action = {
  name: 'Wait 100s',
  displayName: 'Wait 100s',
  category: 'Other',
  castTime: 100,
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
    endState: 'PRESERVE',
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
  hiyuki_wait_1,
  hiyuki_wait_100,
  hiyuki_wait_for_swap,
}
