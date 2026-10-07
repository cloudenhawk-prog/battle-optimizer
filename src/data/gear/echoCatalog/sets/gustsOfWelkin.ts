// Gusts of Welkin echoes (Aero set).
import { echoSkill_nightmareKelpie, echoSkill_reminiscenceFleurdelys, nightmareKelpieInjectedSideEffects } from '../sharedEffects'
import type { EchoCatalogEntry } from '../types'

export const gustsOfWelkinEchoes: EchoCatalogEntry[] = [
  {
    name: 'Nightmare: Kelpie',
    setName: 'Gusts of Welkin',
    cost: 4,
    icon: 'assets/gear/echoes/nightmare_kelpie.png',
    info_icon: 'assets/gear/echoes/info_nightmare_kelpie.png',
    info: 'The Resonator with this Echo equipped in the main slot gains 12.00% Glacio DMG Bonus and 12.00% Aero DMG Bonus. Switching out the Resonator with Outro Skill summons Nightmare: Kelpie to deal 405.00% Aero DMG.',
    firstSlotStats: { glacioBonusDMG: 0.12, aeroBonusDMG: 0.12 },
    echoSkill: echoSkill_nightmareKelpie,
    injectedSideEffects: nightmareKelpieInjectedSideEffects,
  },
  {
    name: 'Reminiscence: Fleurdelys',
    setName: 'Gusts of Welkin',
    cost: 4,
    icon: 'assets/gear/echoes/reminiscence_fleurdelys.png',
    info_icon: 'assets/gear/echoes/info_reminiscence_fleurdelys.png',
    info: 'The Resonator with this Echo equipped in the main slot gains 10.00% Aero DMG Bonus. When Resonator: Aero Rover or Cartethyia equips this Echo, they gain 10.00% more Aero DMG Bonus.',
    firstSlotStats: { aeroBonusDMG: 0.10 },
    echoSkill: echoSkill_reminiscenceFleurdelys,
    conditionalStats: {
      condition: (name) => name === 'Cartethyia' || name === 'Rover',
      stats: { aeroBonusDMG: 0.10 },
    },
  },
  {
    name: 'Capitaneus',
    setName: 'Gusts of Welkin',
    cost: 3,
    icon: 'assets/gear/echoes/capitaneus.png',
    info_icon: 'assets/gear/echoes/info_capitaneus.png',
    info: 'The Resonator with this Echo equipped in their main slot gains 12.00% Spectro DMG Bonus and 12.00% Heavy Attack DMG Bonus.',
    firstSlotStats: { spectroBonusDMG: 0.12, heavyBonusDMG: 0.12 },
  },
  {
    name: 'Hurriclaw',
    setName: 'Gusts of Welkin',
    cost: 3,
    icon: 'assets/gear/echoes/hurriclaw.png',
    info_icon: 'assets/gear/echoes/info_hurriclaw.png',
    info: '',
  },
  {
    name: "Devotee's Flesh",
    setName: 'Gusts of Welkin',
    cost: 1,
    icon: "assets/gear/echoes/devotee's_flesh.png",
    info_icon: "assets/gear/echoes/info_devotee's_flesh.png",
    info: '',
  },
  {
    name: 'Sagittario',
    setName: 'Gusts of Welkin',
    cost: 1,
    icon: 'assets/gear/echoes/sagittario.png',
    info_icon: 'assets/gear/echoes/info_sagittario.png',
    info: '',
  },
  {
    name: 'Sacerdos',
    setName: 'Gusts of Welkin',
    cost: 1,
    icon: 'assets/gear/echoes/sacerdos.png',
    info_icon: 'assets/gear/echoes/info_sacerdos.png',
    info: '',
  },
  // -- stubs (not yet defined) --
  // { name: 'Rage Against the Statue', cost: 4 },
  // { name: 'La Guardia',              cost: 4 },
  // { name: 'Aero Drake',              cost: 1 },
  // { name: 'Electro Drake',           cost: 1 },
  // { name: 'Glacio Drake',            cost: 1 },
  // { name: 'Phantom: Capitaneus',     cost: 3 },
]
