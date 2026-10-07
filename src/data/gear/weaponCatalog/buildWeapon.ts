// Builds an equippable Weapon instance from a catalog entry at a given rank.
import type { Weapon } from '../../../types/gear'
import type { WeaponCatalogEntry } from './types'

/**
 * Build a Weapon instance from a catalog entry at a given rank.
 * Returns null if this rank is not defined in the catalog (i.e., not yet implemented).
 * Creates independent copies of stats and injected modifiers so two characters can equip
 * the same weapon without sharing mutable objects.
 */
export function buildWeapon(entry: WeaponCatalogEntry, rank: 1 | 2 | 3 | 4 | 5, characterName: string): Weapon | null {
  const rankData = entry.ranks[rank]
  if (!rankData) return null

  return {
    name: entry.name,
    weaponType: entry.weaponType,
    icon: entry.icon,
    info: entry.info,
    rank,
    stats: { ...entry.stats },
    injectedModifiers: rankData.injectedModifiers
      ? rankData.injectedModifiers.map(im => ({
          targets: [...im.targets],
          modifiers: im.modifiers.map(m => ({ ...m, ownerCharacter: characterName })),
          ...(im.energyGeneration ? { energyGeneration: [...im.energyGeneration] } : {}),
        }))
      : undefined,
  }
}
