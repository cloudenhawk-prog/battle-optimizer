import type { Action } from '../../types/action'
import { always } from '../../utils/conditions/damageModifierConditions'

// Best opening:
// Skill 1
// Air 1-2
// Plunge (swap cancel)
// Skill 1
// Air 1-2
// Plunge (swap cancel)
// Skill 1 (cancel with liberation) (IF POSSIBLE)
// Liberation
// Skill 3 (swap cancel instantly)

// 5.04 seconds = 80 concerto
// 5.21 seconds = 100 concerto + swap + 20 extra concerto
// All other rotations now only need to generate 80 concerto now (40 if counting liberation + skill 3 quickswap ending)


// Other rotations:
// Gain 120 windstring as fast as possible - you'll probably have enough concerto no matter what



// NOTE: Can you transform to Fleurdelys to activate mandate, then go back in cartethyia form and make use of the Aero Erosion DMG buff on 3 swords plunge (once or twice)? (even if it works, need time to use liberation)

// Try this TEAM OPENING:
// Ciaconna   -  Skill (swap cancel) (echo if sword one)
// Cartethyia -  Skill (swap cancel) (echo)
// Rover      -  Skill 1 (echo)
// Rover      -  Air 1-2
// Rover      -  Plunge (swap cancel)
// Ciaconna   -  Plunge + BA4 (swap cancel)
// Rover      -  Skill 1
// Rover      -  Air 1-2
// Rover      -  Plunge (swap cancel)
// Ciaconna   -  Plunge + BA4 (swap cancel) (echo if weird one)
// Rover      -  Skill 1 (cancel with liberation)    <- Is this possible?
// Rover      -  Liberation
// Rover      -  Skill 3 (swap cancel instantly)
// Ciaconna   -  Intro
// Ciaconna   -  Forte
// Ciaconna   -  (Skill if needed)
// Ciaconna   -  Liberation
// Cartethyia -  Intro
// Cartethyia -  BA2-4
// Cartethyia -  Plunge (3 swords) (worth swapping to rover here for plunge + skill 1 swap cancel?)
// Cartethyia -  BA1-4 (or skip second round?)
// Cartethyia -  Heavy
// Cartethyia -  Skill
// Cartethyia -  Plunge (3 swords)
// Cartethyia -  Transform
// Cartethyia -  Some cool Cartethyia/Rover quickswap shit




export const roverAero_skill_1: Action = {
  name: 'Resonance Skill 1',
  displayName: 'Awakening Gale',
  castTime: 1.00,
  multiplier: (66.44 + 99.66) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 3,
  energyGenerated: [
    { energyType: 'energy', amount: 2.00 + 3.00, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: { // TODO - implement resolver logic for this
    startState: 'GROUND',
    endState: 'AIR'
  },
  offtune: 0.76 // TODO - implement resolver logic for this
}

export const roverAero_skill_1_swap_cancel: Action = {
  name: 'Resonance Skill 1 (swap-cancel)',
  displayName: 'Awakening Gale (swap-cancel)',
  castTime: 0.15,
  multiplier: (66.44 + 99.66) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 3,
  energyGenerated: [
    { energyType: 'energy', amount: 2.00 + 3.00, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: 0.76
}

export const roverAero_skill_2: Action = {
  name: 'Resonance Skill 2',
  displayName: 'Skyfall Severance',
  castTime: 0.84,
  multiplier: (3*23.37 + 105.15) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 12,
  energyGenerated: [
    { energyType: 'energy', amount: 3*0.34 + 1.50, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 5, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR'
  },
  offtune: 3*	0.11 + 0.48
}

export const roverAero_skill_2_swap_cancel: Action = {
  name: 'Resonance Skill 2 (swap-cancel)',
  displayName: 'Skyfall Severance (swap-cancel)',
  castTime: 0.19,
  multiplier: (3*23.37 + 105.15) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 12,
  energyGenerated: [
    { energyType: 'energy', amount: 3*0.34 + 1.50, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 5, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR'
  },
  offtune: 3*	0.11 + 0.48
}

export const roverAero_liberation: Action = {
  name: 'Liberation',
  displayName: 'Omega Storm',
  castTime: 0.08,
  multiplier: 1.2 * (536.79) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 24,
  energyGenerated: [
    { energyType: 'energy', amount: 0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 20, share: 0 },
    { energyType: 'forte', amount: 25, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 150 }],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Bloodpacts Pledge Heal',
      displayName: 'Bloodpacts Pledge Heal',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { skillBonusDMG: 0.26 },
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 12 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND'
  },
  offtune: 4.80
}

export const roverAero_midair_1_2: Action = {
  name: 'Mid Air 1-2',
  displayName: 'Cloudburst Dance 1-2',
  castTime: 0.80,
  multiplier: (128.80 + 141.47) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.92 + 1.01, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2.93 + 3.22, share: 0 },
    { energyType: 'forte', amount: 50, share: 0 },

  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Bloodpacts Pledge Heal',
      displayName: 'Bloodpacts Pledge Heal',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { skillBonusDMG: 0.26 },
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 12 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    },
    {
      source: 'Rover S4',
      displayName: 'Rover S4',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { skillBonusDMG: 0.15 },
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 6 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    previousActions: [roverAero_skill_1],
    endState: 'AIR'
  },
  offtune: 0.29 + 0.32
}


export const roverAero_midair_1_2_swap_cancel: Action = {
  name: 'Mid Air 1-2 (swap-cancel)',
  displayName: 'Cloudburst Dance 1-2 (swap-cancel)',
  castTime: 0.55,
  multiplier: (128.80 + 141.47) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.92 + 1.01, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2.93 + 3.22, share: 0 },
    { energyType: 'forte', amount: 50, share: 0 },

  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Bloodpacts Pledge Heal',
      displayName: 'Bloodpacts Pledge Heal',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { skillBonusDMG: 0.26 },
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 12 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    },
    {
      source: 'Rover S4',
      displayName: 'Rover S4',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { skillBonusDMG: 0.15 },
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 6 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    previousActions: [roverAero_skill_1],
    endState: 'AIR'
  },
  offtune: 0.29 + 0.32
}

export const roverAero_skill_3: Action = {
  name: 'Resonance Skill 3',
  displayName: 'Unbound Flow 1-2',
  castTime: 1.67,
  multiplier: 1.3 * (5*34.30 + 723.03) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 5*2.00 + 20, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 40, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 120 }],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Bloodpacts Pledge Unbound',
      displayName: 'Bloodpacts Pledge Unbound',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { aeroAmplifyDMG: 0.26 },
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: 5*0.60 + 2.83
}

export const roverAero_skill_3_swap_cancel_1: Action = {
  name: 'Resonance Skill 3 (swap-cancel 1)',
  displayName: 'Unbound Flow 1-2 (swap-cancel 1)',
  castTime: 0.17,
  multiplier: 1.3 * (5*34.30 + 723.03) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 5*2.00 + 20, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 40, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 120 }],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Bloodpacts Pledge Unbound',
      displayName: 'Bloodpacts Pledge Unbound',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { aeroAmplifyDMG: 0.26 },
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: 5*0.60 + 2.83
}

export const roverAero_skill_3_swap_cancel_2: Action = {
  name: 'Resonance Skill 3 (swap-cancel 2)',
  displayName: 'Unbound Flow 1-2 (swap-cancel 2)',
  castTime: 1.33,
  multiplier: 1.3 * (5*34.30 + 723.03) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 5*2.00 + 20, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 40, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 120 }],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Bloodpacts Pledge Unbound',
      displayName: 'Bloodpacts Pledge Unbound',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { aeroAmplifyDMG: 0.26 },
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: 5*0.60 + 2.83
}

export const roverAero_plunge: Action = {
  name: 'Plunge',
  displayName: 'Plunge',
  castTime: 0.83,
  multiplier: (140.76) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.52, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 9.60, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND'
  },
  offtune: 0.96
}

export const roverAero_plunge_swap_cancel: Action = {
  name: 'Plunge (swap-cancel)',
  displayName: 'Plunge (swap-cancel)',
  castTime: 0.18,
  multiplier: (140.76) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.52, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 9.60, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR'
  },
  offtune: 0.96
}

export const roverAero_BA_4: Action = {
  name: 'Basic Attack 4',
  displayName: 'Basic Attack 4',
  castTime: 0.43,
  multiplier: (76.72) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1.64, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 5.24, share: 0 },
    { energyType: 'forte', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    previousActions: [roverAero_plunge],
    endState: 'GROUND'
  },
  offtune: 0.52
}

export const roverAero_BA_4_swap_cancel: Action = {
  name: 'Basic Attack 4 (swap-cancel)',
  displayName: 'Basic Attack 4 (swap-cancel)',
  castTime: 0.20,
  multiplier: (76.72) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1.64, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 5.24, share: 0 },
    { energyType: 'forte', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    previousActions: [roverAero_plunge],
    endState: 'GROUND'
  },
  offtune: 0.52
}

export const roverAero_intro: Action = {
  name: 'Intro Skill',
  displayName: 'Relentless Squall',
  castTime: 1.42,
  multiplier: (79.53 +119.29) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 4.00 + 6.00, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 20, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Rover Intro Buff',
      displayName: 'Rover Intro Buff',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { bonusATK: 0.20 },
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 10 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'AIR'
  },
  offtune: 0.46 + 0.69
}

export const roverAero_outro: Action = {
  name: 'Outro Skill',
  displayName: 'Storms Echo',
  castTime: 0,
  multiplier: (0) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['OUTRO'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    // TODO : for 40s: increase the maximum stack of Aero Erosion the 3
  ],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'ANY'
  },
  offtune: 0
}

export const roverAero_echo: Action = {
  name: 'Rover Echo Skill',
  displayName: 'Reminence: Fleurdelys',
  castTime: 0,
  multiplier: (8*27.36 + 136.8) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['ECHO'],
  cooldown: 20,
  energyGenerated: [
    { energyType: 'energy', amount: 8*0.38 + 1.9, share: 0.5, scalingStat: 'energyPercent' }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND'
  },
  offtune: 0
}

export const roverAero_energy: Action = {
  name: 'Energy Up',
  displayName: 'Energy Up',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'energy', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'ANY'
  },
  offtune: 0
}

export const roverAero_concerto: Action = {
  name: 'Concerto Up',
  displayName: 'Concerto Up',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'concerto', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'ANY'
  },
  offtune: 0
}

export const roverAero_forte: Action = {
  name: 'Forte Up',
  displayName: 'Forte Up',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'forte', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'ANY'
  },
  offtune: 0
}