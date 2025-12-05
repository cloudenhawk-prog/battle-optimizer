import type { Character } from "../types/characters"
import type { Snapshot } from "../types/snapshots"

// TODO: Fetch this data from backend later
export const characters: Character[] = [
  {
    name: "Mage",
    actions: [
      { name: "Fireball", duration: 2, damage: 800 },
      { name: "Ice Spike", duration: 1.5, damage: 600 },
    ],
    negativeStatuses: []
  },
  {
    name: "Rogue",
    actions: [
      { name: "Backstab", duration: 1, damage: 400 },
      { name: "Poison", duration: 2.5, damage: 300 },
    ],
    negativeStatuses: []
  },
  {
    name: "Cartethyia",
    actions: [
      { name: "Fleurdelys Strike", duration: 0.5, damage: 700 },
      { name: "Liberation", duration: 3, damage: 1200 },
    ],
    negativeStatuses: ["Aero Erosion", "Spectro Frazzle"],
    dynamicColumns: [
      {
        key: "conviction",
        label: "Conviction",
        render: (snapshot: Snapshot) => snapshot.specialEnergy?.conviction ?? 0,
      },
      {
        key: "rage",
        label: "Rage",
        render: (snapshot: Snapshot) => snapshot.specialEnergy?.rage ?? 0,
      },
    ],
  },
]
