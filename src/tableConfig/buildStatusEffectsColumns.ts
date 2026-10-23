// 'Status Effects' column group: negative statuses, buffs and debuffs as tag columns; their keys seed the engine's columns.
import type { Character } from '../types/character'
import type { ColumnGroup, ColumnDef, StatusMetadata } from '../types/tableDefinitions'
import type { DamageModifier } from '../types/modifiers'
import { createOptionalGroup } from './helpers'
import { negativeStatuses } from '../data/negativeStatuses'

// ========== Build Status Effects Column Group ================================================================================

export function buildStatusEffectsColumns(selectedCharacters: Character[]): ColumnGroup | null {
  const columns: ColumnDef[] = []

  // Build Negative Statuses Column
  const activeNegativeStatuses = Array.from(new Set(selectedCharacters.flatMap(c => c.actions.flatMap(action => action.statusModifications.filter(mod => mod.type === 'negativeStatus').map(mod => mod.targetName)))))

  if (activeNegativeStatuses.length > 0) {
    const negativeStatusByName = new Map(Object.values(negativeStatuses).map(ns => [ns.name, ns]))
    const negativeStatusMetadata: StatusMetadata[] = activeNegativeStatuses.map(status => {
      const negativeStatusData = negativeStatusByName.get(status)
      return {
        key: status,
        label: status,
        icon: `/assets/negative-statuses/${status.toLowerCase().replace(/\s+/g, '_')}.png`,
        color: negativeStatusData?.color,
        maxStacks: negativeStatusData?.maxStacksDefault,
      }
    })

    columns.push({
      key: 'negativeStatuses',
      label: 'Negative Statuses',
      icon: 'assets/table/negativeStatuses.png',
      statusMetadata: negativeStatusMetadata,
      render: () => null,
    })
  }

  // Build Buffs Column
  const buffMetadata = buildModifierStatusMetadata(selectedCharacters, 'buff')

  if (buffMetadata.length > 0) {
    columns.push({
      key: 'buffs',
      label: 'Buffs',
      icon: 'assets/table/buffs.png',
      statusMetadata: buffMetadata,
      render: () => null,
    })
  }

  // Build Debuffs Column
  const debuffMetadata = buildModifierStatusMetadata(selectedCharacters, 'debuff')

  if (debuffMetadata.length > 0) {
    columns.push({
      key: 'debuffs',
      label: 'Debuffs',
      icon: 'assets/table/debuffs.png',
      statusMetadata: debuffMetadata,
      render: () => null,
    })
  }

  return createOptionalGroup(
    {
      label: 'Status Effects',
      icon: 'assets/table/statuses.png'
    },
    columns
  )
}

// ========== Buff / Debuff Metadata ===========================================================================================

/**
 * Tag metadata for every non-permanent buff (or debuff): statusModification targets plus the displayName of
 * every character / action / negative-status damage modifier of that type. Key = name without whitespace.
 */
function buildModifierStatusMetadata(selectedCharacters: Character[], type: 'buff' | 'debuff'): StatusMetadata[] {
  const actionStatuses = selectedCharacters.flatMap(c => c.actions.flatMap(a => a.statusModifications.filter(mod => mod.type === type).map(mod => mod.targetName)))
  const characterModifiers = selectedCharacters.flatMap(c => c.damageModifiers.filter(mod => mod.type === type))
  const actionModifiers = selectedCharacters.flatMap(c => c.actions.flatMap(a => a.damageModifiers.filter(mod => mod.type === type)))
  const negativeStatusModifiers = Object.values(negativeStatuses).flatMap(ns => (ns.damageModifiers ?? []).filter(mod => mod.type === type))

  const allModifiers: DamageModifier[] = [...characterModifiers, ...actionModifiers, ...negativeStatusModifiers]
  const modifierNames = allModifiers.map(mod => mod.displayName)

  // Later modifiers with the same key overwrite earlier ones (maxStacks / color).
  const maxStacksMap = new Map<string, number>()
  const colorMap = new Map<string, string | undefined>()
  const descriptionMap = new Map<string, string>()
  const showStatsMap = new Map<string, boolean>()
  const permanentSet = new Set<string>()
  for (const mod of allModifiers) {
    const key = mod.displayName.replace(/\s+/g, '')
    maxStacksMap.set(key, mod.stackingStrategy.maxStacks)
    colorMap.set(key, mod.color)
    if (mod.durationStrategy.type === 'permanent') {
      permanentSet.add(key)
    }
    if (mod.description) descriptionMap.set(key, mod.description)
    if (mod.showStats) showStatsMap.set(key, true)
  }

  // Permanent modifiers are always on, so they get no tag
  const activeNames = Array.from(new Set([...actionStatuses, ...modifierNames]))
  return activeNames
    .filter(name => {
      const key = name.replace(/\s+/g, '')
      return !permanentSet.has(key)
    })
    .map(name => {
      const key = name.replace(/\s+/g, '')
      const maxStacks = maxStacksMap.get(key) || 1
      const color = colorMap.get(key)
      return {
        key,
        label: name,
        icon: `/assets/modifiers/${name.toLowerCase().replace(/:/g, '').replace(/\s+/g, '_')}.png`,
        maxStacks,
        color,
        description: descriptionMap.get(key),
        showStats: showStatsMap.get(key),
      }
    })
}
