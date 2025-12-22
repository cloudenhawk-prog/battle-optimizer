import type { Snapshot } from "../../types/snapshot"
import type { Character } from "../../types/character"
import type { Dispatch, SetStateAction } from "react"
import type { Enemy } from "../../types/enemy"
import type { DamageEvent } from "../../types/events"
import type { NegativeStatusInAction } from "../../types/negativeStatus"
import type { GlobalColumns, TableConfig } from "../../types/tableDefinitions"
import type { BuffInAction } from "../../types/buff"
import { useRef } from "react"
import { getCharacter, getPrevCharacter } from "../../utils/hooks/characterHelpers"
import { getConcertoValue } from "../../utils/hooks/energyHelpers"
import { getActionFromCharacter } from "../../utils/hooks/actionHelpers"
import { getSnapshotIndex, getPrevSnapshot, copySnapshots, getSnapshotById, assignCharacterToRow } from "../../utils/hooks/snapshotHelpers"
import { buildStepContext, resolveTime, resolveDamageModifiers, resolveDamage, resolveNegativeStatuses, resolveResources } from "../../utils/hooks/resolvers"
import { negativeStatuses as negativeStatusesData } from "../../data/negativeStatuses"
import { createSnapshot } from "../../utils/hooks/snapshotHelpers"
import { collectAllBuffsInAction } from "../../utils/hooks/buffHelpers"

// ========== Hook: useCharacterActions ========================================================================================

type UseCharacterActionsProps = {
  snapshots: Snapshot[]
  setSnapshots: Dispatch<SetStateAction<Snapshot[]>>
  charactersInBattle: Character[]
  enemy: Enemy
  tableConfig: TableConfig
  damageEvents: DamageEvent[]
  setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>
}

export function useCharacterActions({ snapshots, setSnapshots, charactersInBattle, enemy, tableConfig, damageEvents, setDamageEvents }: UseCharacterActionsProps) {
  const charactersMap: Record<string, Character> = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))
  const characterColumnsMap: Record<string, string[]> = Object.fromEntries(tableConfig.characters.map(c => [c.label, c.columns.map(col => col.key.split("_")[1])]))
  const globalColumns: GlobalColumns = {
    basic: tableConfig.basic.columns.map(col => col.key),
    buffs: tableConfig.buffs?.columns.map(col => col.key) ?? [],
    debuffs: tableConfig.debuffs?.columns.map(col => col.key) ?? [],
    negativeStatuses: tableConfig.negativeStatuses?.columns.map(col => col.key) ?? [],
  }

  const negativeStatusesInAction = useRef<NegativeStatusInAction[]>(
    Object.values(negativeStatusesData).map(status => ({
      negativeStatus: status,
      applicationTime: -1,
      timeLeft: 0,
      currentStacks: 0,
      lastDamageTime: 0,
    }))
  )

  const buffsInAction = useRef<BuffInAction[]>(
    collectAllBuffsInAction(charactersMap)
  )

  const handleCharacterSelect = (snapshotId: number, characterName: string) => {
    setSnapshots((prev) =>
      prev
        .map(s => (Number(s.id) === snapshotId ? { ...s, character: characterName, action: "" } : s))
        .filter(s => Number(s.id) <= snapshotId)
    )
  }

  const handleActionSelect = (snapshotId: number, actionName: string) => {
    setSnapshots((prevSnapshots) => {
      let updated = copySnapshots(prevSnapshots)

      if (shouldTriggerOutroIntro(updated, snapshotId)) {
        updated = handleOutroIntroFlow({ snapshots: updated, snapshotId, charactersMap, characterColumnsMap, globalColumns, enemy, damageEvents, setDamageEvents, negativeStatusesInAction, buffsInAction })
        snapshotId += 2
      }

      updated = updateSnapshotsWithAction({ snapshots: updated, snapshotId, actionName, charactersMap, characterColumnsMap, globalColumns, enemy, damageEvents, setDamageEvents, negativeStatusesInAction, buffsInAction })

      return updated
    })
  }

  return { handleCharacterSelect, handleActionSelect }
}

// ========== Internal Helpers =================================================================================================

function updateSnapshotsWithAction(params: {
  snapshots: Snapshot[]
  snapshotId: number
  actionName: string
  charactersMap: Record<string, Character>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  damageEvents: DamageEvent[]
  setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>
  negativeStatusesInAction: React.MutableRefObject<NegativeStatusInAction[]>
  buffsInAction: React.MutableRefObject<BuffInAction[]>
}): Snapshot[] {
  // -------- Validate Input --------------------
  const validated = validateActionInputs(params)
  if (!validated) return params.snapshots
  const { index, character, action, snapshots, current, prev, enemy, negativeStatusesInAction, buffsInAction, charactersMap, characterColumnsMap, globalColumns, setDamageEvents } = validated
  const updatedSnapshots = copySnapshots(snapshots)

  // -------- Resolvers -------------------------

  // Find a good way to collect all modifiers, sideeffect etc in the beginning?

  // > Collect everything and sort it
    // collectActiveModifiers -> modifiers in buffsInAction (if active)   +   modifiers in action + modifiers in character modifiers)

  // > Pass it in the Build Step Context

  // > Extract as needed

  // TODO handle buffs (buffsInAction) similarly to negative status effects - but simpler. First find a way to actually START the effect when stellarRealm is called


  const context = buildStepContext(index, current, prev, character, action, enemy, negativeStatusesInAction.current, buffsInAction.current, charactersMap)

  resolveTime(context)

  resolveDamageModifiers(context)

  resolveDamage(context, setDamageEvents)

  // Step 4: resolveSideEffectsDamage - damage if action triggers aero erosion proc or anything like that
    // Needs a new type, SideEffectDamage - might need to also tell you which stats it scales with (maybe use types so you dont need to type everything - including a standard type that means 'everything')

  // Step 5: resolveSideEffects - updates buffs, debuffs etc if they are still active or get more stacks
    // Only needs logic, as long as buffs/debuffs have 'duration'

  resolveNegativeStatuses(context)

  resolveResources(context)

  // Step 8: collectEvents - grabs logs/events etc
    // Does anything else needs to be updated?
    // Do we need to store logs anywhere?
    // What about damageEvents and nsDamageEvents?

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

function handleOutroIntroFlow(params: {
  snapshots: Snapshot[],
  snapshotId: number,
  charactersMap: Record<string, Character>,
  characterColumnsMap: Record<string, string[]>,
  globalColumns: GlobalColumns,
  enemy: Enemy,
  damageEvents: DamageEvent[],
  setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>,
  negativeStatusesInAction: React.MutableRefObject<NegativeStatusInAction[]>
  buffsInAction: React.MutableRefObject<BuffInAction[]>
}): Snapshot[] {
  const { snapshots, snapshotId, charactersMap, characterColumnsMap, globalColumns, enemy, damageEvents, setDamageEvents, negativeStatusesInAction, buffsInAction } = params

  let updated = copySnapshots(snapshots)

  const prevChar = getPrevCharacter(updated, snapshotId)!
  const currChar = getSnapshotById(updated, snapshotId)!.character!

  // Force Outro row
  updated[snapshotId] = assignCharacterToRow(updated[snapshotId], prevChar)
  updated = updateSnapshotsWithAction({ snapshots: updated, snapshotId, actionName: "Outro", charactersMap, characterColumnsMap, globalColumns, enemy, damageEvents, setDamageEvents, negativeStatusesInAction, buffsInAction })

  // Insert Intro row
  const introId = snapshotId + 1
  updated[introId] = assignCharacterToRow(updated[introId], currChar)
  updated = updateSnapshotsWithAction({ snapshots: updated, snapshotId: introId, actionName: "Intro", charactersMap, characterColumnsMap, globalColumns, enemy, damageEvents, setDamageEvents, negativeStatusesInAction, buffsInAction })

  // Prepare the next blank row for the real action
  const nextId = introId + 1
  updated[nextId] = assignCharacterToRow(updated[nextId], currChar)

  return updated
}

// =============================================================================================================================

function validateActionInputs(params: {
  snapshots: Snapshot[]
  snapshotId: number
  actionName: string
  charactersMap: Record<string, Character>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  negativeStatusesInAction: React.MutableRefObject<NegativeStatusInAction[]>
  buffsInAction: React.MutableRefObject<BuffInAction[]>
  damageEvents: DamageEvent[]
  setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>
}) {
  const { snapshots, snapshotId, actionName, enemy, negativeStatusesInAction, buffsInAction, charactersMap, characterColumnsMap, globalColumns, setDamageEvents } = params

  const index = getSnapshotIndex(snapshots, snapshotId)
  if (index === -1) return null

  const current = snapshots[index]
  if (!current.character) return null

  const character = getCharacter(charactersMap, current.character)
  if (!character) return null

  const action = getActionFromCharacter(charactersMap, current.character, actionName)
  if (!action) return null

  const prev = getPrevSnapshot(snapshots, index)

  return { index, character, action, snapshots, current, prev, enemy, negativeStatusesInAction, buffsInAction, charactersMap, characterColumnsMap, globalColumns, setDamageEvents }
}
