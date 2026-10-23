// The echo catalog record: set name → echoes in that set (an echo appears once per set it belongs to).
import type { EchoCatalogEntry } from './types'
import { windwardPilgrimageEchoes } from './sets/windwardPilgrimage'
import { gustsOfWelkinEchoes } from './sets/gustsOfWelkin'
import { haloOfStarryRadianceEchoes } from './sets/haloOfStarryRadiance'
import { wishesOfQuietSnowfallEchoes } from './sets/wishesOfQuietSnowfall'

/** All echoes grouped by echo set name. Key order = picker order (and golden snapshot order). */
export const echoCatalog: Record<string, EchoCatalogEntry[]> = {
  'Windward Pilgrimage': windwardPilgrimageEchoes,
  'Gusts of Welkin': gustsOfWelkinEchoes,
  'Halo of Starry Radiance': haloOfStarryRadianceEchoes,
  'Wishes of Quiet Snowfall': wishesOfQuietSnowfallEchoes,
  // Sets not modelled yet are listed in pendingSets.ts.
}
