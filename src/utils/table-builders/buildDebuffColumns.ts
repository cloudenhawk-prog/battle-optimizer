import type { Character } from '../../types/character'
import type { ColumnGroup, ColumnDef } from '../../types/tableDefinitions'
import type { Snapshot } from '../../types/snapshot'
import type { DamageModifier } from '../../types/modifiers'
import { createOptionalGroup } from './helpers'
import { negativeStatuses } from '../../data/negativeStatuses'

// ========== Build Debuff Column Group ========================================================================================

export function buildDebuffColumns(selectedCharacters: Character[]): ColumnGroup | null {
  // Collect legacy debuffs from statusModifications
  const inherentDebuffs = selectedCharacters.flatMap(c => c.debuffs.map(b => b.name))
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

  const activeDebuffs = Array.from(new Set([...inherentDebuffs, ...actionDebuffs, ...modifierNames]))

  const columns: ColumnDef[] = activeDebuffs.map(debuff => {
    const key = debuff.replace(/\s+/g, '')
    return {
      key,
      label: debuff,
      icon: `/assets/${key}.png`,
      render: (snapshot: Snapshot) => {
        const debuffs = snapshot.debuffs as Record<string, number> | undefined
        return debuffs?.[key]
      },
    }
  })

  return createOptionalGroup({ label: 'Debuffs', icon: 'assets/debuffs.png' }, columns)
}
