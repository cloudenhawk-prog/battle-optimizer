import type { Action } from "../types/action"
import { stacksOf } from "../utils/conditions/damageModifierConditions"
import { stellarRealmBuff } from "./buffs"

// ========== Mage Actions =====================================================================================================

export const fireball: Action = {
  name: "Fireball",
  castTime: 2,
  multiplier: 0.8,
  scaling: "ATK",
  element: "FUSION",
  dmgType: "SKILL",
  cooldown: 0,
  energyGenerated: [
    { energyType: "energy", amount: 50, share: 0.5, scalingStat: "energyPercent" },
    { energyType: "concerto", amount: 10, share: 0 },
    { energyType: "forte", amount: 10, share: 0 }
  ],
  energyCost: [],
  negativeStatusesApplied: {},
  buffsApplied: [],
  debuffsApplied: [],
  damageModifiers: []
}

export const iceSpike: Action = {
  name: "Ice Spike",
  castTime: 1.5,
  multiplier: 1.2,
  scaling: "ATK",
  element: "GLACIO",
  dmgType: "SKILL",
  cooldown: 5,
  energyGenerated: [
    { energyType: "energy", amount: 30, share: 0.5, scalingStat: "energyPercent" },
    { energyType: "concerto", amount: 20, share: 0 },
    { energyType: "forte", amount: 30, share: 0 }
  ],
  energyCost: [],
  negativeStatusesApplied: {},
  buffsApplied: [],
  debuffsApplied: [],
  damageModifiers: []
}

export const liberatingLightning: Action = {
  name: "Liberating Lightning",
  castTime: 4.5,
  multiplier: 8.0,
  scaling: "ATK",
  element: "ELECTRO",
  dmgType: "LIBERATION",
  cooldown: 0,
  energyGenerated: [
    { energyType: "energy", amount: 25, share: 0.5, scalingStat: "energyPercent" },
    { energyType: "concerto", amount: 50, share: 0 },
    { energyType: "forte", amount: 50, share: 0 }
  ],
  energyCost: [{ energyType: "energy", amount: 100 }],
  negativeStatusesApplied: { "Spectro Frazzle": 3 },
  buffsApplied: [],
  debuffsApplied: [],
  damageModifiers: []
}

export const mageIntro: Action = {
  name: "Intro",
  castTime: 1,
  multiplier: 1.0,
  scaling: "ATK",
  element: "FUSION",
  dmgType: "INTRO",
  cooldown: 0,
  energyGenerated: [
    { energyType: "energy", amount: 10, share: 0.5, scalingStat: "energyPercent" },
    { energyType: "concerto", amount: 10, share: 0 },
    { energyType: "forte", amount: 10, share: 0 }
  ],
  energyCost: [],
  negativeStatusesApplied: {},
  buffsApplied: [],
  debuffsApplied: [],
  damageModifiers: []
}

export const mageOutro: Action = {
  name: "Outro",
  castTime: 0,
  multiplier: 1.0,
  scaling: "ATK",
  element: "FUSION",
  dmgType: "OUTRO",
  cooldown: 0,
  energyGenerated: [
    { energyType: "energy", amount: 10, share: 0.5, scalingStat: "energyPercent" },
    { energyType: "concerto", amount: 0, share: 0 },
    { energyType: "forte", amount: 10, share: 0 }
  ],
  energyCost: [],
  negativeStatusesApplied: {},
  buffsApplied: [],
  debuffsApplied: [],
  damageModifiers: []
}

// ========== Rogue Actions ====================================================================================================

export const backstab: Action = {
  name: "Backstab",
  castTime: 1,
  multiplier: 1.0,
  scaling: "ATK",
  element: "HAVOC",
  dmgType: "BASIC",
  cooldown: 0,
  energyGenerated: [
    { energyType: "energy", amount: 20, share: 0.5, scalingStat: "energyPercent" },
    { energyType: "concerto", amount: 25, share: 0 },
    { energyType: "forte", amount: 40, share: 0 }
  ],
  energyCost: [],
  negativeStatusesApplied: {},
  buffsApplied: [],
  debuffsApplied: [],
  damageModifiers: []
}

export const poison: Action = {
  name: "Poison",
  castTime: 2.5,
  multiplier: 3.0,
  scaling: "ATK",
  element: "HAVOC",
  dmgType: "SKILL",
  cooldown: 5,
  energyGenerated: [
    { energyType: "energy", amount: 25, share: 0.5 },
    { energyType: "concerto", amount: 20, share: 0 },
    { energyType: "forte", amount: 20, share: 0 }
  ],
  energyCost: [],
  negativeStatusesApplied: {},
  buffsApplied: [],
  debuffsApplied: [],
  damageModifiers: []
}

export const rogueIntro: Action = {
  name: "Intro",
  castTime: 1,
  multiplier: 1.0,
  scaling: "ATK",
  element: "HAVOC",
  dmgType: "INTRO",
  cooldown: 0,
  energyGenerated: [
    { energyType: "energy", amount: 10, share: 0.5, scalingStat: "energyPercent" },
    { energyType: "concerto", amount: 10, share: 0 },
    { energyType: "forte", amount: 10, share: 0 }
  ],
  energyCost: [],
  negativeStatusesApplied: {},
  buffsApplied: [],
  debuffsApplied: [],
  damageModifiers: []
}

export const rogueOutro: Action = {
  name: "Outro",
  castTime: 0,
  multiplier: 1.0,
  scaling: "ATK",
  element: "HAVOC",
  dmgType: "OUTRO",
  cooldown: 0,
  energyGenerated: [
    { energyType: "energy", amount: 10, share: 0.5, scalingStat: "energyPercent" },
    { energyType: "concerto", amount: 0, share: 0 },
    { energyType: "forte", amount: 10, share: 0 }
  ],
  energyCost: [],
  negativeStatusesApplied: {},
  buffsApplied: [],
  debuffsApplied: [],
  damageModifiers: []
}

// ========== Cartethyia Actions ===============================================================================================

export const fleurdelysStrike: Action = {
  name: "Fleurdelys Strike",
  castTime: 0.5,
  multiplier: 2.0,
  scaling: "HP",
  element: "AERO",
  dmgType: "BASIC",
  cooldown: 0,
  energyGenerated: [
    { energyType: "energy", amount: 50, share: 0.5, scalingStat: "energyPercent" },
    { energyType: "concerto", amount: 25, share: 0 },
    { energyType: "forte", amount: 1, share: 0 },
    { energyType: "conviction", amount: 50, share: 0 }
  ],
  energyCost: [],
  negativeStatusesApplied: { "Aero Erosion": 1 },
  buffsApplied: [],
  debuffsApplied: [],
  damageModifiers: [
    {
      source: "Cartethyia",
      condition: stacksOf("Aero Erosion"),
      characterStats: {
        multiply: {
          dmgAmplification: 1.1
        }
      }
    }
  ]
}

export const liberation: Action = {
  name: "Liberation",
  castTime: 2,
  multiplier: 15.0,
  scaling: "HP",
  element: "AERO",
  dmgType: "LIBERATION",
  cooldown: 0,
  energyGenerated: [
    { energyType: "energy", amount: 10, share: 0.5, scalingStat: "energyPercent" },
    { energyType: "concerto", amount: 50, share: 0 },
    { energyType: "forte", amount: 1, share: 0 },
    { energyType: "rage", amount: 75, share: 0 }
  ],
  energyCost: [{ energyType: "energy", amount: 100 }],
  negativeStatusesApplied: {},
  buffsApplied: [],
  debuffsApplied: [],
  damageModifiers: []
}

export const stellarRealm: Action = {
  name: "Stellar Realm",
  castTime: 0.3,
  multiplier: 0,
  scaling: "HP",
  element: "AERO",
  dmgType: "SKILL",
  cooldown: 0,
  energyGenerated: [
    { energyType: "energy", amount: 10, share: 0.5, scalingStat: "energyPercent"},
    { energyType: "concerto", amount: 10, share: 0 },
    { energyType: "forte", amount: 1, share: 0 }
  ],
  energyCost: [],
  negativeStatusesApplied: {},
  buffsApplied: [stellarRealmBuff],
  debuffsApplied: [],
  damageModifiers: []
}

export const cartethyiaIntro: Action = {
  name: "Intro",
  castTime: 1,
  multiplier: 1.0,
  scaling: "HP",
  element: "AERO",
  dmgType: "INTRO",
  cooldown: 0,
  energyGenerated: [
    { energyType: "energy", amount: 10, share: 0.5, scalingStat: "energyPercent" },
    { energyType: "concerto", amount: 10, share: 0 },
    { energyType: "forte", amount: 1, share: 0 }
  ],
  energyCost: [],
  negativeStatusesApplied: {},
  buffsApplied: [],
  debuffsApplied: [],
  damageModifiers: []
}

export const cartethyiaOutro: Action = {
  name: "Outro",
  castTime: 0,
  multiplier: 1.0,
  scaling: "HP",
  element: "AERO",
  dmgType: "OUTRO",
  cooldown: 0,
  energyGenerated: [
    { energyType: "energy", amount: 10, share: 0.5 },
    { energyType: "concerto", amount: 0, share: 0 },
    { energyType: "forte", amount: 0, share: 0, scalingStat: "energyPercent" }
  ],
  energyCost: [],
  negativeStatusesApplied: {},
  buffsApplied: [],
  debuffsApplied: [],
  damageModifiers: []
}
