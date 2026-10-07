// Modifier lookups for the data overlay: display-name → modifier info, and contribution-key metadata from events
import type { DamageEvent } from '../../../types/events'
import type { ResolvedCharacter } from '../../../types/character'
import type { CharacterStats, EnemyStats } from '../../../types/stats'

// ========== Modifier Map ======================================================================================================

export type ModifierInfo = {
  displayName: string
  description?: string
  type?: 'buff' | 'debuff'
  characterStats?: Partial<CharacterStats>
  enemyStats?: Partial<EnemyStats>
}

/** Every modifier a team member can apply, keyed by display name (first registration wins). */
export function buildModifierMap(characters: ResolvedCharacter[]): Map<string, ModifierInfo> {
  const map = new Map<string, ModifierInfo>()

  const register = (mod: { source: string; displayName: string; description?: string; type?: 'buff' | 'debuff'; characterStats?: Partial<CharacterStats>; enemyStats?: Partial<EnemyStats> }) => {
    if (!map.has(mod.displayName)) {
      map.set(mod.displayName, {
        displayName: mod.displayName,
        description: mod.description,
        type: mod.type,
        characterStats: mod.characterStats,
        enemyStats: mod.enemyStats,
      })
    }
  }

  for (const char of characters) {
    for (const mod of char.damageModifiers ?? []) register(mod)
    for (const mod of char.flattenedPassiveModifiers ?? []) register(mod)
    for (const milestone of char.resourceMilestones ?? []) register(milestone.modifier)
    for (const action of char.actions ?? []) {
      for (const mod of action.damageModifiers ?? []) register(mod)
      for (const ca of action.coordinatedAttacks ?? []) {
        for (const mod of ca.damageModifiers ?? []) register(mod)
      }
    }
  }

  return map
}

// ========== Contribution Metadata =============================================================================================

export type ContribMeta = { source: string; displayName?: string; isInherent?: boolean }

/** Contribution key → metadata, first occurrence wins. Built from ALL events so entries stay stable when sources toggle. */
export function collectContribMeta(damageEvents: DamageEvent[]): Record<string, ContribMeta> {
  const metaMap: Record<string, ContribMeta> = {}
  for (const event of damageEvents) {
    for (const [key, contrib] of Object.entries(event.contributions)) {
      if (!metaMap[key]) metaMap[key] = { source: contrib.source, displayName: contrib.displayName, isInherent: contrib.isInherent }
    }
  }
  return metaMap
}
