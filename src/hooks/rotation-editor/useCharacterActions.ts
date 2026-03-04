import type { Snapshot } from '../../types/snapshot'
import type { Character } from '../../types/character'
import type { Dispatch, SetStateAction } from 'react'
import type { Enemy } from '../../types/enemy'
import type { DamageEvent } from '../../types/events'
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import type { ModifierInAction } from '../../types/modifiers'
import type { GlobalColumns, TableConfig } from '../../types/tableDefinitions'
import { useRef } from 'react'
import { getCharacter, getPrevCharacter } from '../../utils/hooks/characterHelpers'
import { getConcertoValue } from '../../utils/hooks/energyHelpers'
import { getActionFromCharacter } from '../../utils/hooks/actionHelpers'
import { getSnapshotIndex, getPrevSnapshot, copySnapshots, getSnapshotById, assignCharacterToRow } from '../../utils/hooks/snapshotHelpers'
import { buildStepContext, resolveTime, resolveDamageModifiers, resolveDamage, resolveSideEffectsAndStatuses, resolveModifierState, resolveResources, resolveCooldowns } from '../../utils/hooks/resolvers'
import { negativeStatuses as negativeStatusesData } from '../../data/negativeStatuses'
import { createSnapshot } from '../../utils/hooks/snapshotHelpers'

// ========== Hook: useCharacterActions ========================================================================================

type UseCharacterActionsProps = {
  setSnapshots: Dispatch<SetStateAction<Snapshot[]>>
  charactersInBattle: Character[]
  enemy: Enemy
  tableConfig: TableConfig
  setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>
}

export function useCharacterActions({ setSnapshots, charactersInBattle, enemy, tableConfig, setDamageEvents }: UseCharacterActionsProps) {
  const charactersMap: Record<string, Character> = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))
  const characterColumnsMap: Record<string, string[]> = Object.fromEntries(tableConfig.characters.map(c => [c.label, c.columns.map(col => col.key.split('_')[1])]))

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

  const negativeStatusesInAction = useRef<NegativeStatusInAction[]>(
    Object.values(negativeStatusesData).map(status => ({
      negativeStatus: status,
      applicationTime: -1,
      timeLeft: 0,
      currentStacks: 0,
      lastDamageTime: 0,
    })),
  )

  // Track active modifiers (buffs/debuffs) during the rotation
  // Initially empty - modifiers are activated when applied by actions/characters
  const modifiersInAction = useRef<ModifierInAction[]>([])

  const handleCharacterSelect = (snapshotId: number, characterName: string) => {
    console.log('🔵 handleCharacterSelect called:', { snapshotId, characterName })
    setSnapshots(prev => {
      console.log(
        '🔵 Previous snapshots:',
        prev.map(s => ({ id: s.id, char: s.character, action: s.action })),
      )

      // Update the character for the specified snapshot and clear its action
      const updated = prev.map(s => (Number(s.id) === snapshotId ? { ...s, character: characterName, action: '' } : s))

      // Keep all snapshots up to and including the current one, plus one blank row after
      const currentIndex = updated.findIndex(s => Number(s.id) === snapshotId)
      if (currentIndex === -1) return updated

      // Keep snapshots up to current + 1 (the blank row)
      const result = updated.slice(0, currentIndex + 2)
      console.log(
        '🔵 Updated snapshots:',
        result.map(s => ({ id: s.id, char: s.character, action: s.action })),
      )
      return result
    })
  }

  const handleActionSelect = (snapshotId: number, actionName: string) => {
    console.log('🟢 handleActionSelect called:', { snapshotId, actionName })
    setSnapshots(prevSnapshots => {
      console.log(
        '🟢 Previous snapshots:',
        prevSnapshots.map(s => ({ id: s.id, char: s.character, action: s.action })),
      )
      let updated = copySnapshots(prevSnapshots)

      if (shouldTriggerOutroIntro(updated, snapshotId)) {
        console.log('🟡 Triggering Outro/Intro flow')
        updated = handleOutroIntroFlow({ snapshots: updated, snapshotId, charactersMap, characterColumnsMap, globalColumns, enemy, setDamageEvents, negativeStatusesInAction, modifiersInAction })
        snapshotId += 2
      }

      console.log('🟢 Calling updateSnapshotsWithAction:', { snapshotId, actionName })
      updated = updateSnapshotsWithAction({ snapshots: updated, snapshotId, actionName, charactersMap, characterColumnsMap, globalColumns, enemy, setDamageEvents, negativeStatusesInAction, modifiersInAction })

      console.log(
        '🟢 Final updated snapshots:',
        updated.map(s => ({ id: s.id, char: s.character, action: s.action })),
      )
      return updated
    })
  }

  return { handleCharacterSelect, handleActionSelect }
}

// ========== Internal Helpers =================================================================================================

function updateSnapshotsWithAction(params: { snapshots: Snapshot[]; snapshotId: number; actionName: string; charactersMap: Record<string, Character>; characterColumnsMap: Record<string, string[]>; globalColumns: GlobalColumns; enemy: Enemy; setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>; negativeStatusesInAction: React.MutableRefObject<NegativeStatusInAction[]>; modifiersInAction: React.MutableRefObject<ModifierInAction[]> }): Snapshot[] {
  console.log('🟣 updateSnapshotsWithAction:', { snapshotId: params.snapshotId, actionName: params.actionName })

  // -------- Validate Input --------------------
  const validated = validateActionInputs(params)
  if (!validated) {
    console.log('❌ Validation failed!')
    return params.snapshots
  }
  console.log('✅ Validation passed:', { index: validated.index, character: validated.character.name, action: validated.action.name })

  const { index, character, action, snapshots, prev, enemy, negativeStatusesInAction, modifiersInAction, charactersMap, characterColumnsMap, globalColumns, setDamageEvents } = validated
  const updatedSnapshots = copySnapshots(snapshots)

  // Get the current snapshot from the COPIED array, not the original
  const current = updatedSnapshots[index]
  console.log('🟣 Current snapshot before resolvers:', { id: current.id, char: current.character, action: current.action })

  // -------- Resolvers -------------------------
  const context = buildStepContext(index, current, prev, character, action, enemy, negativeStatusesInAction.current, modifiersInAction.current, charactersMap)

  resolveTime(context)

  resolveDamageModifiers(context)

  resolveDamage(context, setDamageEvents)

  resolveSideEffectsAndStatuses(context, setDamageEvents)

  resolveModifierState(context)

  resolveResources(context)

  resolveCooldowns(context)

  // -------- Update modifiersInAction ref ------
  modifiersInAction.current = context.modifiersInAction

  // -------- Update snapshot -------------------
  updatedSnapshots[index] = { ...context.current }
  console.log('🟣 Snapshot after resolvers:', { id: updatedSnapshots[index].id, char: updatedSnapshots[index].character, action: updatedSnapshots[index].action })

  // -------- Create Next Blank Snapshot --------
  if (index === updatedSnapshots.length - 1) {
    console.log('🟣 Creating next blank snapshot')
    updatedSnapshots.push(createSnapshot(updatedSnapshots[updatedSnapshots.length - 1], charactersMap, characterColumnsMap, globalColumns))
  }

  console.log(
    '🟣 Returning updated snapshots:',
    updatedSnapshots.map(s => ({ id: s.id, char: s.character, action: s.action })),
  )
  return updatedSnapshots
}

// =============================================================================================================================

function shouldTriggerOutroIntro(snapshots: Snapshot[], snapshotId: number): boolean {
  if (snapshotId === 0) return false

  const prevChar = getPrevCharacter(snapshots, snapshotId)
  const currChar = getSnapshotById(snapshots, snapshotId)?.character ?? null

  if (!prevChar || !currChar || prevChar === currChar) return false

  const prevSnapshot = getPrevSnapshot(snapshots, snapshotId)
  const prevConcerto = getConcertoValue(prevSnapshot, prevChar)

  return prevConcerto === 100
}

// =============================================================================================================================

function handleOutroIntroFlow(params: { snapshots: Snapshot[]; snapshotId: number; charactersMap: Record<string, Character>; characterColumnsMap: Record<string, string[]>; globalColumns: GlobalColumns; enemy: Enemy; setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>; negativeStatusesInAction: React.MutableRefObject<NegativeStatusInAction[]>; modifiersInAction: React.MutableRefObject<ModifierInAction[]> }): Snapshot[] {
  const { snapshots, snapshotId, charactersMap, characterColumnsMap, globalColumns, enemy, setDamageEvents, negativeStatusesInAction, modifiersInAction } = params

  let updated = copySnapshots(snapshots)

  const prevChar = getPrevCharacter(updated, snapshotId)!
  const currChar = getSnapshotById(updated, snapshotId)!.character!

  // Force Outro row
  updated[snapshotId] = assignCharacterToRow(updated[snapshotId], prevChar)
  updated = updateSnapshotsWithAction({ snapshots: updated, snapshotId, actionName: 'Outro', charactersMap, characterColumnsMap, globalColumns, enemy, setDamageEvents, negativeStatusesInAction, modifiersInAction })

  // Insert Intro row
  const introId = snapshotId + 1
  updated[introId] = assignCharacterToRow(updated[introId], currChar)
  updated = updateSnapshotsWithAction({ snapshots: updated, snapshotId: introId, actionName: 'Intro', charactersMap, characterColumnsMap, globalColumns, enemy, setDamageEvents, negativeStatusesInAction, modifiersInAction })

  // Prepare the next blank row for the real action
  const nextId = introId + 1
  updated[nextId] = assignCharacterToRow(updated[nextId], currChar)

  return updated
}

// =============================================================================================================================

function validateActionInputs(params: { snapshots: Snapshot[]; snapshotId: number; actionName: string; charactersMap: Record<string, Character>; characterColumnsMap: Record<string, string[]>; globalColumns: GlobalColumns; enemy: Enemy; negativeStatusesInAction: React.MutableRefObject<NegativeStatusInAction[]>; modifiersInAction: React.MutableRefObject<ModifierInAction[]>; setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>> }) {
  const { snapshots, snapshotId, actionName, enemy, negativeStatusesInAction, modifiersInAction, charactersMap, characterColumnsMap, globalColumns, setDamageEvents } = params

  const index = getSnapshotIndex(snapshots, snapshotId)
  console.log('🔍 validateActionInputs - index:', index)
  if (index === -1) {
    console.log('❌ Invalid index')
    return null
  }

  const current = snapshots[index]
  console.log('🔍 validateActionInputs - current snapshot:', { id: current.id, char: current.character })
  if (!current.character) {
    console.log('❌ No character in current snapshot')
    return null
  }

  const character = getCharacter(charactersMap, current.character)
  console.log('🔍 validateActionInputs - character found:', character?.name)
  if (!character) {
    console.log('❌ Character not found in charactersMap')
    return null
  }

  const action = getActionFromCharacter(charactersMap, current.character, actionName)
  console.log('🔍 validateActionInputs - action found:', action?.name)
  if (!action) {
    console.log('❌ Action not found')
    return null
  }

  const prev = getPrevSnapshot(snapshots, index)

  return { index, character, action, snapshots, current, prev, enemy, negativeStatusesInAction, modifiersInAction, charactersMap, characterColumnsMap, globalColumns, setDamageEvents }
}
