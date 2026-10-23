// Character swaps with full Concerto: auto-inserts the Outro (leaving character) and Intro (incoming character) rows.
import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { DamageEvent } from '../../types/events'
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import type { ModifierInAction } from '../../types/modifiers'
import type { CoordinatedAttackInAction } from '../../types/coordinatedAttack'
import type { GlobalColumns } from '../../types/tableDefinitions'
import { getPrevCharacter } from '../state/characterHelpers'
import { getConcertoValue } from '../state/energyHelpers'
import { getActionNameByDmgType } from '../state/actionHelpers'
import { getPrevSnapshot, copySnapshots, getSnapshotById, assignCharacterToRow } from '../state/snapshotHelpers'
import { updateSnapshotsWithAction } from './resolveAction'

// ========== Should Trigger Outro/Intro =======================================================================================

export function shouldTriggerOutroIntro(snapshots: Snapshot[], snapshotId: number): boolean {
  if (snapshotId === 0) return false

  const prevChar = getPrevCharacter(snapshots, snapshotId)
  const currChar = getSnapshotById(snapshots, snapshotId)?.character ?? null

  if (!prevChar || !currChar || prevChar === currChar) return false

  const prevSnapshot = getPrevSnapshot(snapshots, snapshotId)
  const prevConcerto = getConcertoValue(prevSnapshot, prevChar)

  return prevConcerto === 100
}

// ========== Handle Outro/Intro Flow ==========================================================================================

type OutroIntroParams = {
  snapshots: Snapshot[]
  snapshotId: number
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  negativeStatusesInAction: NegativeStatusInAction[]
  modifiersInAction: ModifierInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]
}

type OutroIntroResult = {
  snapshots: Snapshot[]
  damageEvents: DamageEvent[]
  negativeStatusesInAction: NegativeStatusInAction[]
  modifiersInAction: ModifierInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]
}

export function handleOutroIntroFlow(params: OutroIntroParams): OutroIntroResult {
  const { snapshots: inputSnapshots, snapshotId, charactersMap, characterColumnsMap, globalColumns, enemy } = params
  let { negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction } = params

  let updated = copySnapshots(inputSnapshots)
  const allDamageEvents: DamageEvent[] = []

  const prevChar = getPrevCharacter(updated, snapshotId)!
  const currChar = getSnapshotById(updated, snapshotId)!.character!

  const prevCharObj = charactersMap[prevChar]
  const currCharObj = charactersMap[currChar]

  if (!prevCharObj) throw new Error(`handleOutroIntroFlow: character '${prevChar}' not found in charactersMap`)
  if (!currCharObj) throw new Error(`handleOutroIntroFlow: character '${currChar}' not found in charactersMap`)

  const prevSnapshot = getPrevSnapshot(updated, snapshotId)
  const prevCharForm = prevSnapshot?.charactersForms?.[prevChar] ?? ''
  const currCharForm = prevSnapshot?.charactersForms?.[currChar] ?? ''

  const outroActionName = getActionNameByDmgType(prevCharObj, 'OUTRO', prevCharForm)
  const introActionName = getActionNameByDmgType(currCharObj, 'INTRO', currCharForm)

  if (!outroActionName) throw new Error(`handleOutroIntroFlow: character '${prevChar}' has no OUTRO action — every character must define one`)
  if (!introActionName) throw new Error(`handleOutroIntroFlow: character '${currChar}' has no INTRO action — every character must define one`)

  // Force Outro row
  updated[snapshotId] = assignCharacterToRow(updated[snapshotId], prevChar)
  const outroResult = updateSnapshotsWithAction({ snapshots: updated, snapshotId, actionName: outroActionName, charactersMap, characterColumnsMap, globalColumns, enemy, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction })
  updated = outroResult.snapshots
  allDamageEvents.push(...outroResult.damageEvents)
  negativeStatusesInAction = outroResult.negativeStatusesInAction
  modifiersInAction = outroResult.modifiersInAction
  coordinatedAttacksInAction = outroResult.coordinatedAttacksInAction
  updated[snapshotId] = { ...updated[snapshotId], isAutocast: true }

  // Insert Intro row
  const introId = snapshotId + 1
  updated[introId] = assignCharacterToRow(updated[introId], currChar)
  const introResult = updateSnapshotsWithAction({ snapshots: updated, snapshotId: introId, actionName: introActionName, charactersMap, characterColumnsMap, globalColumns, enemy, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction })
  updated = introResult.snapshots
  allDamageEvents.push(...introResult.damageEvents)
  negativeStatusesInAction = introResult.negativeStatusesInAction
  modifiersInAction = introResult.modifiersInAction
  coordinatedAttacksInAction = introResult.coordinatedAttacksInAction
  updated[introId] = { ...updated[introId], isAutocast: true }

  // Prepare the next blank row for the real action
  const nextId = introId + 1
  updated[nextId] = assignCharacterToRow(updated[nextId], currChar)

  return { snapshots: updated, damageEvents: allDamageEvents, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction }
}
