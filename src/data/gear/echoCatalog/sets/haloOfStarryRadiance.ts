// Halo of Starry Radiance echoes (healer set).
import { echoSkill_reactorHusk } from '../sharedEffects'
import type { EchoCatalogEntry } from '../types'

export const haloOfStarryRadianceEchoes: EchoCatalogEntry[] = [
  {
    name: 'Reactor Husk',
    setName: 'Halo of Starry Radiance',
    cost: 4,
    icon: 'assets/gear/echoes/reactor_husk.png',
    info_icon: 'assets/gear/echoes/info_reactor_husk.png',
    info: 'The Resonator with this Echo equipped in their main slot gains 10.00% Energy Regen.',
    firstSlotStats: { energyPercent: 0.10 },
    echoSkill: echoSkill_reactorHusk,
  },
  {
    name: 'Sabercat Prowler',
    setName: 'Halo of Starry Radiance',
    cost: 3,
    icon: 'assets/gear/echoes/sabercat_prowler.png',
    info_icon: 'assets/gear/echoes/info_sabercat_prowler.png',
    info: '',
  },
  {
    name: 'Spacetrek Explorer',
    setName: 'Halo of Starry Radiance',
    cost: 3,
    icon: 'assets/gear/echoes/spacetrek_explorer.png',
    info_icon: 'assets/gear/echoes/info_spacetrek_explorer.png',
    info: '',
  },
  {
    name: 'Geospider S4',
    setName: 'Halo of Starry Radiance',
    cost: 1,
    icon: 'assets/gear/echoes/geospider_s4.png',
    info_icon: 'assets/gear/echoes/info_geospider_s4.png',
    info: '',
  },
  {
    name: 'Mining Drone',
    setName: 'Halo of Starry Radiance',
    cost: 1,
    icon: 'assets/gear/echoes/mining_drone.png',
    info_icon: 'assets/gear/echoes/info_mining_drone.png',
    info: '',
  },
  // -- stubs (not yet defined) --
  // { name: 'Tremor Warrior',    cost: 3 },
  // { name: 'Sabercat Reaver',   cost: 3 },
  // { name: 'Frostbite Coleoid', cost: 3 },
]
