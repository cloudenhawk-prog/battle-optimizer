import type { Character } from "../types/characters"

export const characters: Character[] =
[
  {
    name: "Mage",
    actions: [
      {
        name: "Fireball",
        time: 2,
        damage: 800,
        energyGenerated: {
          energy: 50,
          concerto: 10,
          forte: 10
        },
        negativeStatusesApplied: [],
        buffsApplied: [],
        debuffsApplied: [],
      },
      {
        name: "Ice Spike",
        time: 1.5,
        damage: 600,
        energyGenerated: {
          energy: 30,
          concerto: 20,
          forte: 30
        },
        negativeStatusesApplied: [],
        buffsApplied: [],
        debuffsApplied: [],
      },
      {
        name: "Intro",
        time: 1,
        damage: 1000,
        energyGenerated: {
          energy: 10,
          concerto: 10,
          forte: 10
        },
        negativeStatusesApplied: [],
        buffsApplied: [],
        debuffsApplied: [],
      },
      {
        name: "Outro",
        time: 0,
        damage: 100,
        energyGenerated: {
          energy: 10,
          concerto: 0,
          forte: 10
        },
        negativeStatusesApplied: [],
        buffsApplied: [],
        debuffsApplied: [],
      }
    ],
    negativeStatuses: [],
    buffs: ["Arcane Power"],
    debuffs: [],
    maxEnergies: {
      energy: 100,
      concerto: 100,
      forte: 100,
    }
  },
  {
    name: "Rogue",
    actions: [
      {
        name: "Backstab",
        time: 1,
        damage: 400,
        energyGenerated: {
          energy: 20,
          concerto: 25,
          forte: 40
        },
        negativeStatusesApplied: [],
        buffsApplied: [],
        debuffsApplied: [],
      },
      {
        name: "Poison",
        time: 2.5,
        damage: 300,
        energyGenerated: {
          energy: 25,
          concerto: 20,
          forte: 20
        },
        negativeStatusesApplied: [],
        buffsApplied: [],
        debuffsApplied: [],
      },
      {
        name: "Intro",
        time: 1,
        damage: 1000,
        energyGenerated: {
          energy: 10,
          concerto: 10,
          forte: 10
        },
        negativeStatusesApplied: [],
        buffsApplied: [],
        debuffsApplied: [],
      },
      {
        name: "Outro",
        time: 0,
        damage: 100,
        energyGenerated: {
          energy: 10,
          concerto: 0,
          forte: 10
        },
        negativeStatusesApplied: [],
        buffsApplied: [],
        debuffsApplied: [],
      }
    ],
    negativeStatuses: ["Spectro Frazzle"],
    buffs: [],
    debuffs: ["Poisoned", "Bleeding"],
    maxEnergies: {
      energy: 100,
      concerto: 100,
      forte: 60,
    }
  },
  {
    name: "Cartethyia",
    actions: [
      {
        name: "Fleurdelys Strike",
        time: 0.5,
        damage: 700,
        energyGenerated: {
          energy: 20,
          concerto: 5,
          forte: 1,
          conviction: 50
        },
        negativeStatusesApplied: [],
        buffsApplied: [],
        debuffsApplied: [],
      },
      {
        name: "Liberation",
        time: 3,
        damage: 1200,
        energyGenerated: {
          energy: 60,
          concerto: 25,
          forte: 1,
          rage: 35
        },
        negativeStatusesApplied: [],
        buffsApplied: [],
        debuffsApplied: [],
      },
      {
        name: "Intro",
        time: 1,
        damage: 1000,
        energyGenerated: {
          energy: 10,
          concerto: 10,
          forte: 1
        },
        negativeStatusesApplied: [],
        buffsApplied: [],
        debuffsApplied: [],
      },
      {
        name: "Outro",
        time: 0,
        damage: 100,
        energyGenerated: {
          energy: 10,
          concerto: 0,
          forte: 0
        },
        negativeStatusesApplied: [],
        buffsApplied: [],
        debuffsApplied: [],
      }
    ],
    negativeStatuses: ["Aero Erosion"],
    buffs: [],
    debuffs: [],
    maxEnergies: {
      energy: 100,
      concerto: 100,
      forte: 3,
      conviction: 120,
      rage: 100
    }
  },
]
