// Weapon catalog: every weapon selectable in the gear picker, grouped by weapon type, plus buildWeapon().
//
// An entry holds all static weapon data; only the injected modifiers (and occasionally a stat) vary per rank.
// Only ranks with verified data are defined — undefined ranks are not selectable in the weapon picker.
import type { WeaponCatalogEntry } from './types'
import { swordWeapons } from './swords'
import { pistolWeapons } from './pistols'
import { broadbladeWeapons } from './broadblades'
import { rectifierWeapons } from './rectifiers'

export type { WeaponRankData, WeaponCatalogEntry } from './types'
export { buildWeapon } from './buildWeapon'

// Order matters (picker order + golden snapshot): Sword, Pistol, Broadblade, Rectifier. No Gauntlets yet.
export const weaponCatalog: WeaponCatalogEntry[] = [
  ...swordWeapons,
  ...pistolWeapons,
  ...broadbladeWeapons,
  ...rectifierWeapons,
]
