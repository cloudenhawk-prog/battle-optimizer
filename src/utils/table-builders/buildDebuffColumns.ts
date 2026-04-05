import type { Character } from '../../types/character'
import type { ColumnGroup, ColumnDef, StatusMetadata } from '../../types/tableDefinitions'
import type { DamageModifier } from '../../types/modifiers'
import { createOptionalGroup } from './helpers'
import { negativeStatuses } from '../../data/negativeStatuses'

// ========== Build Debuff Column Group ========================================================================================

export function buildDebuffColumns(selectedCharacters: Character[]): ColumnGroup | null {
  // Collect legacy debuffs from statusModifications
  const actionDebuffs = selectedCharacters.flatMap(c => c.actions.flatMap(a => a.statusModifications.filter(mod => mod.type === 'debuff').map(mod => mod.targetName)))

  // Collect damage modifiers of type 'debuff' from characters
  const characterModifiers = selectedCharacters.flatMap(c => c.damageModifiers.filter(mod => mod.type === 'debuff'))

  // Collect damage modifiers of type 'debuff' from actions
  const actionModifiers = selectedCharacters.flatMap(c => c.actions.flatMap(a => a.damageModifiers.filter(mod => mod.type === 'debuff')))

  // Collect damage modifiers of type 'debuff' from negative statuses
  const negativeStatusModifiers = Object.values(negativeStatuses).flatMap(ns => (ns.damageModifiers ?? []).filter(mod => mod.type === 'debuff'))

  // Combine all debuff-type damage modifiers
  const allModifiers: DamageModifier[] = [...characterModifiers, ...actionModifiers, ...negativeStatusModifiers]
  const modifierNames = allModifiers.map(mod => mod.displayName)

  // Create a map of modifier name -> maxStacks for initialization
  const modifierMaxStacksMap = new Map<string, number>()
  const permanentModifiersSet = new Set<string>()
  const modifierDescriptionMap = new Map<string, string>()
  const modifierShowStatsMap = new Map<string, boolean>()
  for (const mod of allModifiers) {
    const key = mod.displayName.replace(/\s+/g, '')
    modifierMaxStacksMap.set(key, mod.stackingStrategy.maxStacks)
    if (mod.durationStrategy.type === 'permanent') {
      permanentModifiersSet.add(key)
    }
    if (mod.description) modifierDescriptionMap.set(key, mod.description)
    if (mod.showStats) modifierShowStatsMap.set(key, true)
  }

  const activeDebuffs = Array.from(new Set([...actionDebuffs, ...modifierNames]))

  // Build metadata for all debuffs (excluding permanent ones)
  const statusMetadata: StatusMetadata[] = activeDebuffs
    .filter(debuff => {
      const key = debuff.replace(/\s+/g, '')
      return !permanentModifiersSet.has(key)
    })
    .map(debuff => {
      const key = debuff.replace(/\s+/g, '')
      const maxStacks = modifierMaxStacksMap.get(key) || 1
      return {
        key,
        label: debuff,
        icon: `/assets/${debuff.toLowerCase().replace(/\s+/g, '_')}.png`,
        maxStacks,
        description: modifierDescriptionMap.get(key),
        showStats: modifierShowStatsMap.get(key),
      }
    })

  // Create a single column that will render all debuffs as tags
  const columns: ColumnDef[] = [
    {
      key: 'debuffs',
      label: 'Debuffs',
      icon: 'assets/debuffs.png',
      statusMetadata,
      render: () => null, // Rendering is handled by StatusTagGroup in the table
    },
  ]

  return createOptionalGroup({ label: 'Debuffs', icon: 'assets/debuffs.png' }, columns)
}
