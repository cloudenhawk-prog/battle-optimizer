import type { Character } from "../types/character"
import { fireball, iceSpike, liberatingLightning, mageIntro, mageOutro } from "./actions"
import { backstab, poison, rogueIntro, rogueOutro } from "./actions"
import { fleurdelysStrike, liberation, cartethyiaIntro, cartethyiaOutro } from "./actions"
import { mageStats, rogueStats, cartethyiaStats } from "./stats"

// ========== Characters =======================================================================================================

export const characters: Character[] =
[
  {
    name: "Mage",
    actions: [fireball, iceSpike, liberatingLightning, mageIntro, mageOutro],
    buffs: [],
    debuffs: [],
    maxEnergies: { energy: 100, concerto: 100, forte: 100 },
    stats: mageStats,
    damageModifiers: []
  },
  {
    name: "Rogue",
    actions: [backstab, poison, rogueIntro, rogueOutro],
    buffs: [],
    debuffs: [],
    maxEnergies: { energy: 100, concerto: 100, forte: 60 },
    stats: rogueStats,
    damageModifiers: []
  },
  {
    name: "Cartethyia",
    actions: [fleurdelysStrike, liberation, cartethyiaIntro, cartethyiaOutro],
    buffs: [],
    debuffs: [],
    maxEnergies: { energy: 100, concerto: 100, forte: 3, conviction: 120, rage: 100 },
    stats: cartethyiaStats,
    damageModifiers: []
  },
]
