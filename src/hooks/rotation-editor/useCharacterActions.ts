import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Dispatch, SetStateAction } from 'react'
import type { Enemy } from '../../types/enemy'
import type { DamageEvent } from '../../types/events'
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import type { ModifierInAction } from '../../types/modifiers'
import type { CoordinatedAttackInAction } from '../../types/coordinatedAttack'
import type { GlobalColumns, TableConfig } from '../../types/tableDefinitions'
import { useRef } from 'react'
import { getCharacter, getPrevCharacter } from '../../utils/hooks/characterHelpers'
import { getConcertoValue } from '../../utils/hooks/energyHelpers'
import { getActionFromCharacter, getActionNameByDmgType } from '../../utils/hooks/actionHelpers'
import { getSnapshotIndex, getPrevSnapshot, copySnapshots, getSnapshotById, assignCharacterToRow } from '../../utils/hooks/snapshotHelpers'
import { buildStepContext, resolveTime, resolveDamageModifiers, resolveDamage, resolveSideEffectsAndStatuses, resolveModifierState, resolveResources, resolveCooldowns, resolveCoordinatedAttacks, resolveCastState, resolveResourceMilestones } from '../../utils/hooks/resolvers'
import { negativeStatuses as negativeStatusesData } from '../../data/negativeStatuses'
import { createSnapshot } from '../../utils/hooks/snapshotHelpers'

// ========== Hook: useCharacterActions ========================================================================================

type UseCharacterActionsProps = {
  setSnapshots: Dispatch<SetStateAction<Snapshot[]>>
  charactersInBattle: ResolvedCharacter[]
  enemy: Enemy
  tableConfig: TableConfig
  setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>
}

export function useCharacterActions({ setSnapshots, charactersInBattle, enemy, tableConfig, setDamageEvents }: UseCharacterActionsProps) {
  const charactersMap: Record<string, ResolvedCharacter> = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))
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

  // Track active coordinated attacks during the rotation
  const coordinatedAttacksInAction = useRef<CoordinatedAttackInAction[]>([])

  const handleCharacterSelect = (snapshotId: number, characterName: string) => {
    setSnapshots(prev => {
      // Update the character for the specified snapshot and clear its action
      const updated = prev.map(s => (Number(s.id) === snapshotId ? { ...s, character: characterName, action: '' } : s))

      // Keep all snapshots up to and including the current one, plus one blank row after
      const currentIndex = updated.findIndex(s => Number(s.id) === snapshotId)
      if (currentIndex === -1) return updated

      // Keep snapshots up to current + 1 (the blank row)
      const result = updated.slice(0, currentIndex + 2)
      return result
    })
  }

  const handleActionSelect = (snapshotId: number, actionName: string) => {
    setSnapshots(prevSnapshots => {
      let updated = copySnapshots(prevSnapshots)

      if (shouldTriggerOutroIntro(updated, snapshotId)) {
        updated = handleOutroIntroFlow({ snapshots: updated, snapshotId, charactersMap, characterColumnsMap, globalColumns, enemy, setDamageEvents, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction })
        snapshotId += 2
      }

      updated = updateSnapshotsWithAction({ snapshots: updated, snapshotId, actionName, charactersMap, characterColumnsMap, globalColumns, enemy, setDamageEvents, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction })

      return updated
    })
  }

  return { handleCharacterSelect, handleActionSelect, coordinatedAttacksInAction }
}

// ========== Internal Helpers =================================================================================================

function updateSnapshotsWithAction(params: { snapshots: Snapshot[]; snapshotId: number; actionName: string; charactersMap: Record<string, ResolvedCharacter>; characterColumnsMap: Record<string, string[]>; globalColumns: GlobalColumns; enemy: Enemy; setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>; negativeStatusesInAction: React.MutableRefObject<NegativeStatusInAction[]>; modifiersInAction: React.MutableRefObject<ModifierInAction[]>; coordinatedAttacksInAction: React.MutableRefObject<CoordinatedAttackInAction[]> }): Snapshot[] {
  // -------- Validate Input --------------------
  const validated = validateActionInputs(params)
  if (!validated) {
    return params.snapshots
  }

  const { index, character, action, snapshots, prev, enemy, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction, charactersMap, characterColumnsMap, globalColumns, setDamageEvents } = validated
  const updatedSnapshots = copySnapshots(snapshots)

  // Get the current snapshot from the COPIED array, not the original
  const current = updatedSnapshots[index]

  // -------- Resolvers -------------------------
  const context = buildStepContext(index, current, prev, character, action, enemy, negativeStatusesInAction.current, modifiersInAction.current, charactersMap, coordinatedAttacksInAction.current)

  resolveTime(context)

  resolveDamageModifiers(context)

  resolveDamage(context, setDamageEvents)

  resolveSideEffectsAndStatuses(context, setDamageEvents)

  resolveCoordinatedAttacks(context, setDamageEvents)

  resolveResources(context)

  resolveResourceMilestones(context)

  resolveModifierState(context)

  resolveCooldowns(context)

  resolveCastState(context)

  // -------- Update modifiersInAction ref ------
  modifiersInAction.current = context.modifiersInAction

  // -------- Update snapshot -------------------
  updatedSnapshots[index] = { ...context.current }

  // -------- Create Next Blank Snapshot --------
  if (index === updatedSnapshots.length - 1) {
    updatedSnapshots.push(createSnapshot(updatedSnapshots[updatedSnapshots.length - 1], charactersMap, characterColumnsMap, globalColumns))
  }

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

function handleOutroIntroFlow(params: { snapshots: Snapshot[]; snapshotId: number; charactersMap: Record<string, ResolvedCharacter>; characterColumnsMap: Record<string, string[]>; globalColumns: GlobalColumns; enemy: Enemy; setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>; negativeStatusesInAction: React.MutableRefObject<NegativeStatusInAction[]>; modifiersInAction: React.MutableRefObject<ModifierInAction[]>; coordinatedAttacksInAction: React.MutableRefObject<CoordinatedAttackInAction[]> }): Snapshot[] {
  const { snapshots, snapshotId, charactersMap, characterColumnsMap, globalColumns, enemy, setDamageEvents, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction } = params

  let updated = copySnapshots(snapshots)

  const prevChar = getPrevCharacter(updated, snapshotId)!
  const currChar = getSnapshotById(updated, snapshotId)!.character!

  const prevCharObj = charactersMap[prevChar]
  const currCharObj = charactersMap[currChar]

  if (!prevCharObj) throw new Error(`handleOutroIntroFlow: character '${prevChar}' not found in charactersMap`)
  if (!currCharObj) throw new Error(`handleOutroIntroFlow: character '${currChar}' not found in charactersMap`)

  // Get current forms for both characters
  const prevSnapshot = getPrevSnapshot(updated, snapshotId)
  const prevCharForm = prevSnapshot?.charactersForms?.[prevChar] ?? ''
  const currCharForm = prevSnapshot?.charactersForms?.[currChar] ?? ''

  const outroActionName = getActionNameByDmgType(prevCharObj, 'OUTRO', prevCharForm)
  const introActionName = getActionNameByDmgType(currCharObj, 'INTRO', currCharForm)

  if (!outroActionName) throw new Error(`handleOutroIntroFlow: character '${prevChar}' has no OUTRO action — every character must define one`)
  if (!introActionName) throw new Error(`handleOutroIntroFlow: character '${currChar}' has no INTRO action — every character must define one`)

  // Force Outro row
  updated[snapshotId] = assignCharacterToRow(updated[snapshotId], prevChar)
  updated = updateSnapshotsWithAction({ snapshots: updated, snapshotId, actionName: outroActionName, charactersMap, characterColumnsMap, globalColumns, enemy, setDamageEvents, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction })

  // Insert Intro row
  const introId = snapshotId + 1
  updated[introId] = assignCharacterToRow(updated[introId], currChar)
  updated = updateSnapshotsWithAction({ snapshots: updated, snapshotId: introId, actionName: introActionName, charactersMap, characterColumnsMap, globalColumns, enemy, setDamageEvents, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction })

  // Prepare the next blank row for the real action
  const nextId = introId + 1
  updated[nextId] = assignCharacterToRow(updated[nextId], currChar)

  return updated
}

// =============================================================================================================================

function validateActionInputs(params: { snapshots: Snapshot[]; snapshotId: number; actionName: string; charactersMap: Record<string, ResolvedCharacter>; characterColumnsMap: Record<string, string[]>; globalColumns: GlobalColumns; enemy: Enemy; negativeStatusesInAction: React.MutableRefObject<NegativeStatusInAction[]>; modifiersInAction: React.MutableRefObject<ModifierInAction[]>; coordinatedAttacksInAction: React.MutableRefObject<CoordinatedAttackInAction[]>; setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>> }) {
  const { snapshots, snapshotId, actionName, enemy, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction, charactersMap, characterColumnsMap, globalColumns, setDamageEvents } = params

  const index = getSnapshotIndex(snapshots, snapshotId)
  if (index === -1) {
    return null
  }

  const current = snapshots[index]
  if (!current.character) {
    return null
  }

  const character = getCharacter(charactersMap, current.character)
  if (!character) {
    return null
  }

  const prev = getPrevSnapshot(snapshots, index)

  const action = getActionFromCharacter(charactersMap, current.character, actionName, prev)
  if (!action) {
    return null
  }

  return { index, character, action, snapshots, current, prev, enemy, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction, charactersMap, characterColumnsMap, globalColumns, setDamageEvents }
}
