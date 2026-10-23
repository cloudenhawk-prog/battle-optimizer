// Echo skills and injected side effects shared by catalog entries (the same echo appears in several sets).
import type { Action } from '../../../types/action'
import type { InjectedSideEffect } from '../../../types/gear'
import { nightmareKelpieOutroTrigger } from '../../sideEffects/sideEffects'

// ========== Shared Echo Skills ================================================================================================
// Defined once here and referenced by catalog entries — the same echo skill appears in multiple sets.

export const echoSkill_reminiscenceFleurdelys: Action = {
  name: 'Reminiscence: Fleurdelys (Active)',
  displayName: 'Reminiscence: Fleurdelys (Active)',
  category: 'Echo Skill',
  castTime: 0,
  multiplier: (8 * 27.36 + 136.8) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['ECHO'],
  cooldown: 20,
  energyGenerated: [{ energyType: 'energy', amount: 8 * 0.38 + 1.9, share: 0.5, scalingStat: 'energyPercent' }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: { startState: 'ANY', endState: 'PRESERVE' },
  offtune: 0,
}

export const echoSkill_nightmareKelpie: Action = {
  name: 'Echo Skill',
  displayName: 'Nightmare: Kelpie (Active)',
  category: 'Echo Skill',
  castTime: 0,
  multiplier: 405 / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['ECHO'],
  cooldown: 25,
  energyGenerated: [{ energyType: 'energy', amount: 2.81, share: 0.5, scalingStat: 'energyPercent' }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND', // TODO: verify
    endState: 'AIR',      // TODO: verify
  },
  offtune: 0,
}

export const echoSkill_aleph1: Action = {
  name: 'Echo Skill',
  displayName: 'Aleph-1 (Active)',
  category: 'Echo Skill',
  castTime: 0.09,
  multiplier: (5 * 21.88 + 164.16) / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['ECHO'],
  cooldown: 20,
  energyGenerated: [{ energyType: 'energy', amount: 5 * 0.12 +	1.36, share: 0.5, scalingStat: 'energyPercent' }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    swapOutState: 'PRESERVE',
    endState: 'PRESERVE',
    persistenceTime: 0.09,
    requiresSwapOut: true
  },
  offtune: 0,
}

export const echoSkill_glommoth: Action = {
  name: 'Echo Skill',
  displayName: 'Glommoth (Active)',
  category: 'Echo Skill',
  castTime: 1.0, // TODO: verify cast time
  multiplier: 273.60 / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['ECHO'],
  cooldown: 20,
  energyGenerated: [{ energyType: 'energy', amount: 1.9, share: 0.5, scalingStat: 'energyPercent' }], // TODO: verify energy
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: { startState: 'ANY', endState: 'PRESERVE' },
  offtune: 0,
}

export const echoSkill_reactorHusk: Action = {
  name: 'Echo Skill',
  displayName: 'Reactor Husk (Active)',
  category: 'Echo Skill',
  castTime: 0.09,
  multiplier: 351 / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['ECHO'],
  cooldown: 20,
  energyGenerated: [{ energyType: 'energy', amount: 4.87, share: 0.5, scalingStat: 'energyPercent' }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    swapOutState: 'PRESERVE',
    endState: 'GROUND',
    persistenceTime: 0.09,
    requiresSwapOut: true
  },
  offtune: 0,
}

// ========== Shared Injected Side Effects =====================================================================================

export const nightmareKelpieInjectedSideEffects: InjectedSideEffect[] = [
  { targets: [{ tag: 'OUTRO_ACTION' }], sideEffects: [nightmareKelpieOutroTrigger] },
]
