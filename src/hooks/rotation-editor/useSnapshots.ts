import { useState } from 'react'
import type { Character } from '../../types/character'
import type { EnergyType } from '../../types/baseTypes'
import type { TableConfig, GlobalColumns } from '../../types/tableDefinitions'
import type { Snapshot } from '../../types/snapshot'
import type { Settings } from '../useSettings'
import type { CharacterStats } from '../../types/stats'
import type { EditModeEntry } from '../../types/editMode'

// ========== Hook: useSnapshots ===============================================================================================

type UseSnapshotsProps = {
  charactersInBattle: Character[]
  tableConfig: TableConfig
  settings: Settings
}

export function useSnapshots({ charactersInBattle, tableConfig, settings }: UseSnapshotsProps) {
  const charactersMap = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))
  const characterColumnsMap = Object.fromEntries(charactersInBattle.map(c => [c.name, Object.keys(c.maxEnergies)]))

  // Extract columns from statusEffects group
  const statusEffectsColumns = tableConfig.statusEffects?.columns ?? []
  const buffsCol = statusEffectsColumns.find(col => col.key === 'buffs')
  const debuffsCol = statusEffectsColumns.find(col => col.key === 'debuffs')
  const negativeStatusesCol = statusEffectsColumns.find(col => col.key === 'negativeStatuses')

  const globalColumns: GlobalColumns = {
    basic: tableConfig.basic.columns.map(col => col.key),
    buffs: buffsCol?.statusMetadata?.map(meta => meta.key) ?? [],
    debuffs: debuffsCol?.statusMetadata?.map(meta => meta.key) ?? [],
    negativeStatuses: negativeStatusesCol?.statusMetadata?.map(meta => meta.key) ?? [],
  }

  const [snapshots, setSnapshots] = useState<Snapshot[]>([createEmptySnapshot(charactersMap, characterColumnsMap, globalColumns, tableConfig, settings.startWithFullEnergy)])
  const [editModeEntries, setEditModeEntries] = useState<EditModeEntry[]>([])

  function resetTimeline() {
    setSnapshots([createEmptySnapshot(charactersMap, characterColumnsMap, globalColumns, tableConfig, settings.startWithFullEnergy)])
    setEditModeEntries([])
  }

  function addEditModeEntry(entry: EditModeEntry) {
    setEditModeEntries(prev => [...prev, entry])
  }

  function removeEditModeEntry(id: string) {
    setEditModeEntries(prev => prev.filter(e => e.id !== id))
  }

  function updateEditModeEntry(id: string, updates: Partial<Omit<EditModeEntry, 'id'>>) {
    setEditModeEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  function clearEditModeEntries() {
    setEditModeEntries([])
  }

  return { snapshots, setSnapshots, resetTimeline, createEmptySnapshot, editModeEntries, setEditModeEntries, addEditModeEntry, removeEditModeEntry, updateEditModeEntry, clearEditModeEntries }
}

// ========== Internal Helpers =================================================================================================

export function createEmptySnapshot(charactersMap: Record<string, Character>, characterColumnsMap: Record<string, string[]>, globalColumns: GlobalColumns, tableConfig: TableConfig, startWithFullEnergy = false): Snapshot {
  const charactersEnergies = Object.fromEntries(
    Object.keys(charactersMap).map(charName => {
      const char = charactersMap[charName]
      return [
        charName,
        Object.fromEntries(
          characterColumnsMap[charName].map(key => {
            if (startWithFullEnergy && key === 'energy') return [key, char.maxEnergies.energy ?? 0]
            const starting = char.startingEnergies?.(char.sequence)?.[key as EnergyType]
            if (starting !== undefined) return [key, Math.min(starting, char.maxEnergies[key as EnergyType] ?? starting)]
            return [key, 0]
          })
        ),
      ]
    })
  )

  const basicValues = Object.fromEntries(globalColumns.basic.map(col => [col, 0]))
  const buffs = Object.fromEntries(globalColumns.buffs.map(col => [col, 0]))
  const debuffs = Object.fromEntries(globalColumns.debuffs.map(col => [col, 0]))
  const negativeStatuses = Object.fromEntries(globalColumns.negativeStatuses.map(col => [col, 0]))

  // Get maxStacks from statusEffects columns metadata
  const statusEffectsColumns = tableConfig.statusEffects?.columns ?? []
  const buffsCol = statusEffectsColumns.find(col => col.key === 'buffs')
  const debuffsCol = statusEffectsColumns.find(col => col.key === 'debuffs')

  const buffsMaxStacks = Object.fromEntries((buffsCol?.statusMetadata || []).map(meta => [meta.key, meta.maxStacks || 1]))
  const debuffsMaxStacks = Object.fromEntries((debuffsCol?.statusMetadata || []).map(meta => [meta.key, meta.maxStacks || 1]))

  const snapshot: Snapshot = {
    id: '0',
    character: '',
    action: '',
    fromTime: 0,
    toTime: 0,
    damage: 0,
    dps: 0,
    ...basicValues,
    charactersEnergies,
    buffs,
    buffsTimeLeft: Object.fromEntries(globalColumns.buffs.map(col => [col, 0])),
    buffsSwapsLeft: Object.fromEntries(globalColumns.buffs.map(col => [col, 0])),
    buffsMaxStacks,
    buffsActivationStats: {},
    buffsTargetCharacter: {},
    debuffs,
    debuffsTimeLeft: Object.fromEntries(globalColumns.debuffs.map(col => [col, 0])),
    debuffsSwapsLeft: Object.fromEntries(globalColumns.debuffs.map(col => [col, 0])),
    debuffsMaxStacks,
    negativeStatuses,
    negativeStatusesTimeLeft: Object.fromEntries(globalColumns.negativeStatuses.map(col => [col, 0])),
    negativeStatusesMaxStacks: {},
    coordinatedAttacks: {},
    coordinatedAttacksTimeLeft: {},
    coordinatedAttacksSwapRequired: {},
    charactersCooldowns: {},
    charactersActionStacks: {},
    charactersActionStacksConfig: {},
    charactersPositions: {},
    charactersPersistentUntil: {},
    charactersLastAction: {},
    charactersRequiresSwapOut: {},
    charactersForms: {},
    charactersSwapCooldownUntil: {},
    charactersAttemptFollowUp: {},
    charactersComboWindows: {},
    charactersForteGrants: {},
    charactersComboChainTags: {},
    charactersOffFieldSince: {},
    offFieldTriggerEvents: {},
  }

  // Pre-evaluate permanent modifier conditions using starting energies so that buff
  // display is correct from the very first row, before any action is resolved.
  const minimalCtx = { current: snapshot, negativeStatusesInAction: [] } as any
  for (const char of Object.values(charactersMap)) {
    for (const modifier of char.damageModifiers ?? []) {
      if (modifier.durationStrategy && modifier.durationStrategy.type !== 'permanent') continue
      const key = modifier.displayName.replace(/\s+/g, '')
      const conditionValue = modifier.condition(minimalCtx)
      if (conditionValue <= 0) continue
      if (modifier.type === 'buff') {
        snapshot.buffs[key] = 1
        snapshot.buffsTimeLeft[key] = Infinity
        snapshot.buffsSwapsLeft[key] = Infinity
        snapshot.buffsMaxStacks[key] = modifier.stackingStrategy.maxStacks
        if (modifier.characterStats) {
          const scaled: Partial<CharacterStats> = {}
          for (const [stat, val] of Object.entries(modifier.characterStats) as [keyof CharacterStats, number][]) {
            scaled[stat] = val * conditionValue
          }
          snapshot.buffsActivationStats[key] = scaled
        }
      } else if (modifier.type === 'debuff') {
        snapshot.debuffs[key] = 1
        snapshot.debuffsTimeLeft[key] = Infinity
        snapshot.debuffsSwapsLeft[key] = Infinity
        snapshot.debuffsMaxStacks[key] = modifier.stackingStrategy.maxStacks
      }
    }
  }

  return snapshot
}
