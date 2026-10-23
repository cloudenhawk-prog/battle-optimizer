// Weapon catalog entry types: static weapon data plus per-rank injected modifiers.
import type { WeaponType, InjectedModifier } from '../../../types/gear'
import type { CharacterStats } from '../../../types/stats'

export type WeaponRankData = {
  injectedModifiers?: InjectedModifier[]
}

export type WeaponCatalogEntry = {
  name: string
  weaponType: WeaponType
  /** Base stats that are identical across all ranks. */
  stats: Partial<CharacterStats>
  icon: string
  info: string
  /** Only ranks with defined data are selectable in the weapon picker. */
  ranks: Partial<Record<1 | 2 | 3 | 4 | 5, WeaponRankData>>
}
