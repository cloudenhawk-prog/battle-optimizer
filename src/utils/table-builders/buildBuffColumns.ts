import type { Character } from '../../types/character'
import type { ColumnGroup, ColumnDef, StatusMetadata } from '../../types/tableDefinitions'
import type { DamageModifier } from '../../types/modifiers'
import { createOptionalGroup } from './helpers'
import { negativeStatuses } from '../../data/negativeStatuses'

// ========== Build Buff Column Group ==========================================================================================

export function buildBuffColumns(selectedCharacters: Character[]): ColumnGroup | null {
  // Collect legacy buffs from statusModifications
  const actionBuffs = selectedCharacters.flatMap(c => c.actions.flatMap(a => a.statusModifications.filter(mod => mod.type === 'buff').map(mod => mod.targetName)))

  // Collect damage modifiers of type 'buff' from characters
  const characterModifiers = selectedCharacters.flatMap(c => c.damageModifiers.filter(mod => mod.type === 'buff'))

  // Collect damage modifiers of type 'buff' from actions
  const actionModifiers = selectedCharacters.flatMap(c => c.actions.flatMap(a => a.damageModifiers.filter(mod => mod.type === 'buff')))

  // Collect damage modifiers of type 'buff' from negative statuses
  const negativeStatusModifiers = Object.values(negativeStatuses).flatMap(ns => (ns.damageModifiers ?? []).filter(mod => mod.type === 'buff'))

  // Combine all buff-type damage modifiers
  const allModifiers: DamageModifier[] = [...characterModifiers, ...actionModifiers, ...negativeStatusModifiers]
  const modifierNames = allModifiers.map(mod => mod.displayName)

  // Create a map of modifier name -> maxStacks for initialization
  const modifierMaxStacksMap = new Map<string, number>()
  const permanentModifiersSet = new Set<string>()
  for (const mod of allModifiers) {
    const key = mod.displayName.replace(/\s+/g, '')
    modifierMaxStacksMap.set(key, mod.stackingStrategy.maxStacks)
    if (mod.durationStrategy.type === 'permanent') {
      permanentModifiersSet.add(key)
    }
  }

  const activeBuffs = Array.from(new Set([...actionBuffs, ...modifierNames]))

  // Build metadata for all buffs (excluding permanent ones)
  const statusMetadata: StatusMetadata[] = activeBuffs
    .filter(buff => {
      const key = buff.replace(/\s+/g, '')
      return !permanentModifiersSet.has(key)
    })
    .map(buff => {
      const key = buff.replace(/\s+/g, '')
      const maxStacks = modifierMaxStacksMap.get(key) || 1
      return {
        key,
        label: buff,
        icon: `/assets/${key}.png`,
        maxStacks,
      }
    })

  // Create a single column that will render all buffs as tags
  const columns: ColumnDef[] = [
    {
      key: 'buffs',
      label: 'Buffs',
      icon: 'assets/buffs.png',
      statusMetadata,
      render: () => null, // Rendering is handled by StatusTagGroup in the table
    },
  ]

  return createOptionalGroup({ label: 'Buffs', icon: 'assets/buffs.png' }, columns)
}
