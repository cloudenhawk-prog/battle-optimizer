import type { Character } from '../../types/character'
import type { ColumnGroup, ColumnDef, StatusMetadata } from '../../types/tableDefinitions'
import type { DamageModifier } from '../../types/modifiers'
import { createOptionalGroup } from './helpers'
import { negativeStatuses } from '../../data/negativeStatuses'

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
  const actionBuffs = selectedCharacters.flatMap(c => c.actions.flatMap(a => a.statusModifications.filter(mod => mod.type === 'buff').map(mod => mod.targetName)))
  const characterModifiers = selectedCharacters.flatMap(c => c.damageModifiers.filter(mod => mod.type === 'buff'))
  const actionModifiers = selectedCharacters.flatMap(c => c.actions.flatMap(a => a.damageModifiers.filter(mod => mod.type === 'buff')))
  const negativeStatusModifiers = Object.values(negativeStatuses).flatMap(ns => (ns.damageModifiers ?? []).filter(mod => mod.type === 'buff'))

  const allBuffModifiers: DamageModifier[] = [...characterModifiers, ...actionModifiers, ...negativeStatusModifiers]
  const buffModifierNames = allBuffModifiers.map(mod => mod.displayName)

  const modifierMaxStacksMap = new Map<string, number>()
  const modifierColorMap = new Map<string, string | undefined>()
  const permanentModifiersSet = new Set<string>()
  for (const mod of allBuffModifiers) {
    const key = mod.displayName.replace(/\s+/g, '')
    modifierMaxStacksMap.set(key, mod.stackingStrategy.maxStacks)
    modifierColorMap.set(key, mod.color)
    if (mod.durationStrategy.type === 'permanent') {
      permanentModifiersSet.add(key)
    }
  }

  const activeBuffs = Array.from(new Set([...actionBuffs, ...buffModifierNames]))
  const buffMetadata: StatusMetadata[] = activeBuffs
    .filter(buff => {
      const key = buff.replace(/\s+/g, '')
      return !permanentModifiersSet.has(key)
    })
    .map(buff => {
      const key = buff.replace(/\s+/g, '')
      const maxStacks = modifierMaxStacksMap.get(key) || 1
      const color = modifierColorMap.get(key)
      return {
        key,
        label: buff,
        icon: `/assets/modifiers/${buff.toLowerCase().replace(/\s+/g, '_')}.png`,
        maxStacks,
        color,
      }
    })

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
  const actionDebuffs = selectedCharacters.flatMap(c => c.actions.flatMap(a => a.statusModifications.filter(mod => mod.type === 'debuff').map(mod => mod.targetName)))
  const characterDebuffModifiers = selectedCharacters.flatMap(c => c.damageModifiers.filter(mod => mod.type === 'debuff'))
  const actionDebuffModifiers = selectedCharacters.flatMap(c => c.actions.flatMap(a => a.damageModifiers.filter(mod => mod.type === 'debuff')))
  const negativeStatusDebuffModifiers = Object.values(negativeStatuses).flatMap(ns => (ns.damageModifiers ?? []).filter(mod => mod.type === 'debuff'))

  const allDebuffModifiers: DamageModifier[] = [...characterDebuffModifiers, ...actionDebuffModifiers, ...negativeStatusDebuffModifiers]
  const debuffModifierNames = allDebuffModifiers.map(mod => mod.displayName)

  const debuffMaxStacksMap = new Map<string, number>()
  const debuffColorMap = new Map<string, string | undefined>()
  const permanentDebuffsSet = new Set<string>()
  for (const mod of allDebuffModifiers) {
    const key = mod.displayName.replace(/\s+/g, '')
    debuffMaxStacksMap.set(key, mod.stackingStrategy.maxStacks)
    debuffColorMap.set(key, mod.color)
    if (mod.durationStrategy.type === 'permanent') {
      permanentDebuffsSet.add(key)
    }
  }

  const activeDebuffs = Array.from(new Set([...actionDebuffs, ...debuffModifierNames]))
  const debuffMetadata: StatusMetadata[] = activeDebuffs
    .filter(debuff => {
      const key = debuff.replace(/\s+/g, '')
      return !permanentDebuffsSet.has(key)
    })
    .map(debuff => {
      const key = debuff.replace(/\s+/g, '')
      const maxStacks = debuffMaxStacksMap.get(key) || 1
      const color = debuffColorMap.get(key)
      return {
        key,
        label: debuff,
        icon: `/assets/modifiers/${debuff.toLowerCase().replace(/\s+/g, '_')}.png`,
        maxStacks,
        color,
      }
    })

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
