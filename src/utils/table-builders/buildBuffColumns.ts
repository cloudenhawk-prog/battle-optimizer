import type { Character } from '../../types/character'
import type { ColumnGroup, ColumnDef } from '../../types/tableDefinitions'
import type { Snapshot } from '../../types/snapshot'
import type { DamageModifier } from '../../types/modifiers'
import { createOptionalGroup } from './helpers'
import { negativeStatuses } from '../../data/negativeStatuses'

// ========== Build Buff Column Group ==========================================================================================

export function buildBuffColumns(selectedCharacters: Character[]): ColumnGroup | null {
  // Collect legacy buffs from statusModifications
  const inherentBuffs = selectedCharacters.flatMap(c => c.buffs.map(b => b.name))
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

  const activeBuffs = Array.from(new Set([...inherentBuffs, ...actionBuffs, ...modifierNames]))

  const columns: ColumnDef[] = activeBuffs.map(buff => {
    const key = buff.replace(/\s+/g, '')
    return {
      key,
      label: buff,
      icon: `/assets/${key}.png`,
      render: (snapshot: Snapshot) => {
        const buffs = snapshot.buffs as Record<string, number> | undefined
        return buffs?.[key]
      },
    }
  })

  return createOptionalGroup({ label: 'Buffs', icon: 'assets/buffs.png' }, columns)
}
