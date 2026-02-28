import type { Character } from '../../types/character'
import type { ColumnGroup, ColumnDef } from '../../types/tableDefinitions'
import type { Snapshot } from '../../types/snapshot'
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
  for (const mod of allModifiers) {
    const key = mod.displayName.replace(/\s+/g, '')
    modifierMaxStacksMap.set(key, mod.stackingStrategy.maxStacks)
    if (mod.durationStrategy.type === 'permanent') {
      permanentModifiersSet.add(key)
    }
  }

  const activeDebuffs = Array.from(new Set([...actionDebuffs, ...modifierNames]))

  const columns: ColumnDef[] = activeDebuffs
    .filter(debuff => {
      const key = debuff.replace(/\s+/g, '')
      // Filter out permanent modifiers - they don't need tracking in the table
      return !permanentModifiersSet.has(key)
    })
    .map(debuff => {
      const key = debuff.replace(/\s+/g, '')
      const maxStacks = modifierMaxStacksMap.get(key) || 1
      return {
        key,
        label: debuff,
        icon: `/assets/${key}.png`,
        maxStacks, // Store maxStacks in column metadata
        render: (snapshot: Snapshot) => {
          const debuffs = snapshot.debuffs as Record<string, number> | undefined
          const stacks = debuffs?.[key]
          return stacks !== undefined ? stacks : 0 // Show 0 instead of undefined
        },
      }
    })

  return createOptionalGroup({ label: 'Debuffs', icon: 'assets/debuffs.png' }, columns)
}
