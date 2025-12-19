import type { Character } from "../types/character"
import { stacksOf } from "../engine/conditions"

export const characters: Character[] =
[
  {
    name: "Mage",
    actions: [
      {
        name: "Fireball",
        castTime: 2,
        multiplier: 0.80,
        scaling: "ATK",
        element: "FUSION",
        dmgType: "SKILL",
        cooldown: 0,
        energyGenerated: [
          {
            energyType: "energy",
            amount: 50,
            share: 0.50,
            scalingStat: "energyPercent"
          },
          {
            energyType: "concerto",
            amount: 10,
            share: 0
          },
          {
            energyType: "forte",
            amount: 10,
            share: 0
          }
        ],
        energyCost: [],
        negativeStatusesApplied: {},
        buffsApplied: [],
        debuffsApplied: [],
        damageModifiers: []
      },
      {
        name: "Ice Spike",
        castTime: 1.5,
        multiplier: 1.20,
        scaling: "ATK",
        element: "GLACIO",
        dmgType: "SKILL",
        cooldown: 5,
        energyGenerated: [
          {
            energyType: "energy",
            amount: 30,
            share: 0.50,
            scalingStat: "energyPercent"
          },
          {
            energyType: "concerto",
            amount: 20,
            share: 0
          },
          {
            energyType: "forte",
            amount: 30,
            share: 0
          }
        ],
        energyCost: [],
        negativeStatusesApplied: {},
        buffsApplied: [],
        debuffsApplied: [],
        damageModifiers: []
      },
      {
        name: "Liberating Lightning",
        castTime: 4.5,
        multiplier: 8.00,
        scaling: "ATK",
        element: "ELECTRO",
        dmgType: "LIBERATION",
        cooldown: 0,
        energyGenerated: [
          {
            energyType: "energy",
            amount: 25,
            share: 0.50,
            scalingStat: "energyPercent"
          },
          {
            energyType: "concerto",
            amount: 50,
            share: 0
          },
          {
            energyType: "forte",
            amount: 50,
            share: 0
          }
        ],
        energyCost: [
          {
            energyType: "energy",
            amount: 100,
          }
        ],
        negativeStatusesApplied: { "Spectro Frazzle": 3 },
        buffsApplied: [],
        debuffsApplied: [],
        damageModifiers: []
      },
      {
        name: "Intro",
        castTime: 1,
        multiplier: 1.00,
        scaling: "ATK",
        element: "FUSION",
        dmgType: "INTRO",
        cooldown: 0,
        energyGenerated: [
          {
            energyType: "energy",
            amount: 10,
            share: 0.50,
            scalingStat: "energyPercent"
          },
          {
            energyType: "concerto",
            amount: 10,
            share: 0
          },
          {
            energyType: "forte",
            amount: 10,
            share: 0
          }
        ],
        energyCost: [],
        negativeStatusesApplied: {},
        buffsApplied: [],
        debuffsApplied: [],
        damageModifiers: []
      },
      {
        name: "Outro",
        castTime: 0,
        multiplier: 1.00,
        scaling: "ATK",
        element: "FUSION",
        dmgType: "OUTRO",
        cooldown: 0,
        energyGenerated: [
          {
            energyType: "energy",
            amount: 10,
            share: 0.50,
            scalingStat: "energyPercent"
          },
          {
            energyType: "concerto",
            amount: 0,
            share: 0
          },
          {
            energyType: "forte",
            amount: 10,
            share: 0
          }
        ],
        energyCost: [],
        negativeStatusesApplied: {},
        buffsApplied: [],
        debuffsApplied: [],
        damageModifiers: []
      }
    ],
    buffs: [],
    debuffs: [],
    maxEnergies: {
      energy: 100,
      concerto: 100,
      forte: 100,
    },
    stats: {
      level: 90,
      baseATK: 774,
      flatATK: 100,
      percentATK: 1.24,
      baseHP: 14800,
      flatHP: 0,
      percentHP: 1.00,
      baseDEF: 611,
      flatDEF: 100,
      percentDEF: 1.00,
      critRate: 0.49,
      critDamage: 2.30,
      dmgAmplification: 1.00,
      defIgnore: 0.00,
      elementalResPEN: 0.00,
      resistancePEN: 0.00,
      basicDMG: 1.00,
      heavyDMG: 1.00,
      skillDMG: 1.00,
      liberationDMG: 1.00,
      coordinatedDMG: 1.00,
      echoDMG: 1.00,
      introDMG: 1.00,
      outroDMG: 1.00,
      aeroErosionDMG: 1.00,
      spectroFrazzleDMG: 1.00,
      havocBaneDMG: 1.00,
      glacioChafeDMG: 1.00,
      fusionBurstDMG: 1.00,
      electroFlareDMG: 1.00,
      spectro: 1.00,
      fusion: 1.00,
      aero: 1.30,
      glacio: 1.00,
      electro: 1.00,
      havoc: 1.00,
      energyPercent: 1.0
    },
    damageModifiers: []
  },
  {
    name: "Rogue",
    actions: [
      {
        name: "Backstab",
        castTime: 1,
        multiplier: 1.00,
        scaling: "ATK",
        element: "HAVOC",
        dmgType: "BASIC",
        cooldown: 0,
        energyGenerated: [
          {
            energyType: "energy",
            amount: 20,
            share: 0.50,
            scalingStat: "energyPercent"
          },
          {
            energyType: "concerto",
            amount: 25,
            share: 0
          },
          {
            energyType: "forte",
            amount: 40,
            share: 0
          }
        ],
        energyCost: [],
        negativeStatusesApplied: {},
        buffsApplied: [],
        debuffsApplied: [],
        damageModifiers: []
      },
      {
        name: "Poison",
        castTime: 2.5,
        multiplier: 3.00,
        scaling: "ATK",
        element: "HAVOC",
        dmgType: "SKILL",
        cooldown: 5,
        energyGenerated: [
          {
            energyType: "energy",
            amount: 25,
            share: 0.50
          },
          {
            energyType: "concerto",
            amount: 20,
            share: 0
          },
          {
            energyType: "forte",
            amount: 20,
            share: 0
          }
        ],
        energyCost: [],
        negativeStatusesApplied: {},
        buffsApplied: [],
        debuffsApplied: [],
        damageModifiers: []
      },
      {
        name: "Intro",
        castTime: 1,
        multiplier: 1.00,
        scaling: "ATK",
        element: "HAVOC",
        dmgType: "INTRO",
        cooldown: 0,
        energyGenerated: [
          {
            energyType: "energy",
            amount: 10,
            share: 0.50,
            scalingStat: "energyPercent"
          },
          {
            energyType: "concerto",
            amount: 10,
            share: 0
          },
          {
            energyType: "forte",
            amount: 10,
            share: 0
          }
        ],
        energyCost: [],
        negativeStatusesApplied: {},
        buffsApplied: [],
        debuffsApplied: [],
        damageModifiers: []
      },
      {
        name: "Outro",
        castTime: 0,
        multiplier: 1.00,
        scaling: "ATK",
        element: "HAVOC",
        dmgType: "OUTRO",
        cooldown: 0,
        energyGenerated: [
          {
            energyType: "energy",
            amount: 10,
            share: 0.50,
            scalingStat: "energyPercent"
          },
          {
            energyType: "concerto",
            amount: 0,
            share: 0
          },
          {
            energyType: "forte",
            amount: 10,
            share: 0
          }
        ],
        energyCost: [],
        negativeStatusesApplied: {},
        buffsApplied: [],
        debuffsApplied: [],
        damageModifiers: []
      }
    ],
    buffs: [],
    debuffs: [],
    maxEnergies: {
      energy: 100,
      concerto: 100,
      forte: 60,
    },
    stats: {
      level: 90,
      baseATK: 774,
      flatATK: 100,
      percentATK: 1.24,
      baseHP: 14800,
      flatHP: 0,
      percentHP: 1.00,
      baseDEF: 611,
      flatDEF: 100,
      percentDEF: 1.00,
      critRate: 0.49,
      critDamage: 2.30,
      dmgAmplification: 1.00,
      defIgnore: 0.00,
      elementalResPEN: 0.00,
      resistancePEN: 0.00,
      basicDMG: 1.00,
      heavyDMG: 1.00,
      skillDMG: 1.00,
      liberationDMG: 1.00,
      coordinatedDMG: 1.00,
      echoDMG: 1.00,
      introDMG: 1.00,
      outroDMG: 1.00,
      aeroErosionDMG: 1.00,
      spectroFrazzleDMG: 1.00,
      havocBaneDMG: 1.00,
      glacioChafeDMG: 1.00,
      fusionBurstDMG: 1.00,
      electroFlareDMG: 1.00,
      spectro: 1.00,
      fusion: 1.00,
      aero: 1.30,
      glacio: 1.00,
      electro: 1.00,
      havoc: 1.00,
      energyPercent: 1.0
    },
    damageModifiers: []
  },
  {
    name: "Cartethyia",
    actions: [
      {
        name: "Fleurdelys Strike",
        castTime: 0.5,
        multiplier: 2.00,
        scaling: "HP",
        element: "AERO",
        dmgType: "BASIC",
        cooldown: 0,
        energyGenerated: [
          {
            energyType: "energy",
            amount: 50,
            share: 0.50,
            scalingStat: "energyPercent"
          },
          {
            energyType: "concerto",
            amount: 25,
            share: 0
          },
          {
            energyType: "forte",
            amount: 1,
            share: 0
          },
          {
            energyType: "conviction",
            amount: 50,
            share: 0
          }
        ],
        energyCost: [],
        negativeStatusesApplied: { "Aero Erosion": 1 },
        buffsApplied: [],
        debuffsApplied: [],
        damageModifiers: [
          {
            source: "Fleurdelys Strike – Aero Erosion scaling",
            condition: stacksOf("Aero Erosion"), //TODO : could set up types and a smart resolver that makes it easier to write conditions in a more intuitive way
            characterStats: {
              multiply: {
                dmgAmplification: 1.1
              }
            }
          }
        ]
      },
      {
        name: "Liberation",
        castTime: 2,
        multiplier: 15.00,
        scaling: "HP",
        element: "AERO",
        dmgType: "LIBERATION",
        cooldown: 0,
        energyGenerated: [
          {
            energyType: "energy",
            amount: 10,
            share: 0.50,
            scalingStat: "energyPercent"
          },
          {
            energyType: "concerto",
            amount: 50,
            share: 0
          },
          {
            energyType: "forte",
            amount: 1,
            share: 0
          },
          {
            energyType: "rage",
            amount: 75,
            share: 0
          }
        ],
        energyCost: [
          {
            energyType: "energy",
            amount: 100,
          }
        ],
        negativeStatusesApplied: {},
        buffsApplied: [],
        debuffsApplied: [],
        damageModifiers: []
      },
      {
        name: "Intro",
        castTime: 1,
        multiplier: 1.00,
        scaling: "HP",
        element: "AERO",
        dmgType: "INTRO",
        cooldown: 0,
        energyGenerated: [
          {
            energyType: "energy",
            amount: 10,
            share: 0.50,
            scalingStat: "energyPercent"
          },
          {
            energyType: "concerto",
            amount: 10,
            share: 0
          },
          {
            energyType: "forte",
            amount: 1,
            share: 0
          }
        ],
        energyCost: [],
        negativeStatusesApplied: {},
        buffsApplied: [],
        debuffsApplied: [],
        damageModifiers: []
      },
      {
        name: "Outro",
        castTime: 0,
        multiplier: 1.00,
        scaling: "HP",
        element: "AERO",
        dmgType: "OUTRO",
        cooldown: 0,
        energyGenerated: [
          {
            energyType: "energy",
            amount: 10,
            share: 0.50
          },
          {
            energyType: "concerto",
            amount: 0,
            share: 0
          },
          {
            energyType: "forte",
            amount: 0,
            share: 0,
            scalingStat: "energyPercent"
          }
        ],
        energyCost: [],
        negativeStatusesApplied: {},
        buffsApplied: [],
        debuffsApplied: [],
        damageModifiers: []
      }
    ],
    buffs: [],
    debuffs: [],
    maxEnergies: {
      energy: 100,
      concerto: 100,
      forte: 3,
      conviction: 120,
      rage: 100
    },
    stats: {
      level: 90,
      baseATK: 774,
      flatATK: 100,
      percentATK: 1.24,
      baseHP: 14800,
      flatHP: 0,
      percentHP: 1.00,
      baseDEF: 611,
      flatDEF: 100,
      percentDEF: 1.00,
      critRate: 0.49,
      critDamage: 2.30,
      dmgAmplification: 1.00,
      defIgnore: 0.00,
      elementalResPEN: 0.00,
      resistancePEN: 0.00,
      basicDMG: 1.00,
      heavyDMG: 1.00,
      skillDMG: 1.00,
      liberationDMG: 1.00,
      coordinatedDMG: 1.00,
      echoDMG: 1.00,
      introDMG: 1.00,
      outroDMG: 1.00,
      aeroErosionDMG: 1.00,
      spectroFrazzleDMG: 1.00,
      havocBaneDMG: 1.00,
      glacioChafeDMG: 1.00,
      fusionBurstDMG: 1.00,
      electroFlareDMG: 1.00,
      spectro: 1.00,
      fusion: 1.00,
      aero: 1.30,
      glacio: 1.00,
      electro: 1.00,
      havoc: 1.00,
      energyPercent: 1.50
    },
    damageModifiers: [] // TODO
  },
]
