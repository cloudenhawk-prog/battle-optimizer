import type { Character } from '../types/character'
import { fireball, iceSpike, liberatingLightning, mageIntro, mageOutro } from './actions'
import { backstab, poison, rogueIntro, rogueOutro } from './actions'
import { energiesUp, cartethyiaBA1_4, cartethyiaBA2_4, cartethyiaHeavy, cartethyiaPlunge1, cartethyiaPlunge2, cartethyiaPlunge3, cartethyiaSkill, cartethyiaTransform, fleurdelysBA1_5, fleurdelysBA3_5, fleurdelysHeavy, fleurdelysHeavyEnhanced, fleurdelysAerial1_2, fleurdelysAerial1_3, fleurdelysSkill_1, fleurdelysSkill_2, fleurdelysLiberation, cartethyiaIntro, cartethyiaOutro } from './actions'
import { mageStats, rogueStats, cartethyiaStats } from './stats'
import { stacksOf, atLeastOneStackOf, always } from '../utils/conditions/damageModifierConditions'

// ========== Characters =======================================================================================================

export const characters: Character[] = [
  {
    name: 'Mage',
    actions: [fireball, iceSpike, liberatingLightning, mageIntro, mageOutro],
    buffs: [],
    debuffs: [],
    maxEnergies: { energy: 100, concerto: 100, forte: 100 },
    stats: mageStats,
    damageModifiers: [],
  },
  {
    name: 'Rogue',
    actions: [backstab, poison, rogueIntro, rogueOutro],
    buffs: [],
    debuffs: [],
    maxEnergies: { energy: 100, concerto: 100, forte: 60 },
    stats: rogueStats,
    damageModifiers: [],
  },
  {
    name: 'Cartethyia',
    actions: [
      energiesUp,
      cartethyiaBA1_4,
      cartethyiaBA2_4,
      cartethyiaHeavy,
      cartethyiaPlunge1,
      cartethyiaPlunge2,
      cartethyiaPlunge3,
      cartethyiaSkill,
      cartethyiaTransform,
      fleurdelysBA1_5,
      fleurdelysBA3_5,
      fleurdelysHeavy,
      fleurdelysHeavyEnhanced,
      fleurdelysAerial1_2,
      fleurdelysAerial1_3,
      fleurdelysSkill_1,
      fleurdelysSkill_2,
      fleurdelysLiberation,
      cartethyiaIntro,
      cartethyiaOutro],
    buffs: [],
    debuffs: [],
    maxEnergies: { energy: 125, concerto: 100, forte: 3, conviction: 120 },
    stats: cartethyiaStats,
    damageModifiers: [
      { source: 'Inherent Skill', displayName: 'Inherent Skill', condition: stacksOf('Aero Erosion'), characterStats: { amplifyDMG: 0.1 } },
      { source: 'Defier\'s Thorn', displayName: 'Defier Skill 1', condition: atLeastOneStackOf('Aero Erosion'), characterStats: { amplifyDMG: 0.2 } },
      { source: 'Defier\'s Thorn', displayName: 'Defier Skill 2', condition: always(), characterStats: { defIgnore: 0.08 } }
    ]
  },
]
