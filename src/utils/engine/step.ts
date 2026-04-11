import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { DamageEvent } from '../../types/events'
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import type { ModifierInAction } from '../../types/modifiers'
import type { CoordinatedAttackInAction } from '../../types/coordinatedAttack'
import type { GlobalColumns } from '../../types/tableDefinitions'
import { getCharacter, getPrevCharacter } from '../hooks/characterHelpers'
import { getConcertoValue } from '../hooks/energyHelpers'
import { getActionFromCharacter, getActionNameByDmgType } from '../hooks/actionHelpers'
import { getSnapshotIndex, getPrevSnapshot, copySnapshots, getSnapshotById, assignCharacterToRow, createSnapshot } from '../hooks/snapshotHelpers'
import { isFollowUpCastableNow, validateMustChain } from '../conditions/mustChainValidator'
import { buildStepContext, resolveTime, resolveDamageModifiers, resolveDamage, resolveSideEffectsAndStatuses, resolveModifierState, resolveResources, resolveCooldowns, resolveCoordinatedAttacks, resolveCastState, resolveResourceMilestones, resolveOffFieldTriggers } from '../hooks/resolvers'
import { negativeStatuses as negativeStatusesData } from '../../data/negativeStatuses'

// ========== Types ============================================================================================================

/**
 * Holds the mutable cross-step simulation state that lives outside of individual snapshots.
 * Pass this into engineStep and use the returned updated copy for each subsequent step.
 */
export type EngineState = {
  negativeStatusesInAction: NegativeStatusInAction[]
  modifiersInAction: ModifierInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]
}

export type EngineStepParams = {
  snapshots: Snapshot[]
  snapshotId: number
  actionName: string
  engineState: EngineState
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  autocastFollowUps?: boolean
}

export type EngineStepResult = {
  snapshots: Snapshot[]
  damageEvents: DamageEvent[]
  engineState: EngineState
}

// ========== Init =============================================================================================================

/**
 * Creates a fresh EngineState from the global negative status definitions.
 * Call this once at the start of a simulation (MCTS rollout, or rotation editor init).
 */
export function initEngineState(): EngineState {
  return {
    negativeStatusesInAction: Object.values(negativeStatusesData).map(status => ({
      negativeStatus: status,
      applicationTime: -1,
      timeLeft: 0,
      currentStacks: 0,
      lastDamageTime: 0,
    })),
    modifiersInAction: [],
    coordinatedAttacksInAction: [],
  }
}

// ========== Engine Step ======================================================================================================

/**
 * Advances the simulation by one user-selected action.
 *
 * Handles the full pipeline:
 *   1. Outro/Intro auto-insertion on character swap with full concerto
 *   2. The selected action itself
 *   3. Autocast follow-up chain (when autocastFollowUps is true, default)
 *
 * Returns the updated snapshot array, all damage events produced this step,
 * and the updated EngineState for use in subsequent steps.
 */
export function engineStep(params: EngineStepParams): EngineStepResult {
  const { snapshots: inputSnapshots, snapshotId: inputSnapshotId, actionName, engineState, charactersMap, characterColumnsMap, globalColumns, enemy, autocastFollowUps = true } = params

  let snapshots = copySnapshots(inputSnapshots)
  const allDamageEvents: DamageEvent[] = []

  // Copy mutable engine state so original is not mutated
  let negativeStatusesInAction = engineState.negativeStatusesInAction
  let modifiersInAction = engineState.modifiersInAction
  let coordinatedAttacksInAction = engineState.coordinatedAttacksInAction

  let snapshotId = inputSnapshotId

  // Handle Outro/Intro flow when swapping with full concerto
  if (shouldTriggerOutroIntro(snapshots, snapshotId)) {
    const outroIntroResult = handleOutroIntroFlow({
      snapshots,
      snapshotId,
      charactersMap,
      characterColumnsMap,
      globalColumns,
      enemy,
      negativeStatusesInAction,
      modifiersInAction,
      coordinatedAttacksInAction,
    })
    snapshots = outroIntroResult.snapshots
    allDamageEvents.push(...outroIntroResult.damageEvents)
    negativeStatusesInAction = outroIntroResult.negativeStatusesInAction
    modifiersInAction = outroIntroResult.modifiersInAction
    coordinatedAttacksInAction = outroIntroResult.coordinatedAttacksInAction
    snapshotId += 2
  }

  // Resolve the selected action
  const actionResult = updateSnapshotsWithAction({
    snapshots,
    snapshotId,
    actionName,
    charactersMap,
    characterColumnsMap,
    globalColumns,
    enemy,
    negativeStatusesInAction,
    modifiersInAction,
    coordinatedAttacksInAction,
  })
  snapshots = actionResult.snapshots
  allDamageEvents.push(...actionResult.damageEvents)
  negativeStatusesInAction = actionResult.negativeStatusesInAction
  modifiersInAction = actionResult.modifiersInAction
  coordinatedAttacksInAction = actionResult.coordinatedAttacksInAction

  // Autocast follow-up chain
  if (autocastFollowUps) {
    const followUpResult = autocastFollowUpChain({
      snapshots,
      resolvedSnapshotId: snapshotId,
      charactersMap,
      characterColumnsMap,
      globalColumns,
      enemy,
      negativeStatusesInAction,
      modifiersInAction,
      coordinatedAttacksInAction,
    })
    snapshots = followUpResult.snapshots
    allDamageEvents.push(...followUpResult.damageEvents)
    negativeStatusesInAction = followUpResult.negativeStatusesInAction
    modifiersInAction = followUpResult.modifiersInAction
    coordinatedAttacksInAction = followUpResult.coordinatedAttacksInAction
  }

  return {
    snapshots,
    damageEvents: allDamageEvents,
    engineState: { negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction },
  }
}

// ========== Update Snapshots With Action =====================================================================================

type UpdateSnapshotsParams = {
  snapshots: Snapshot[]
  snapshotId: number
  actionName: string
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  negativeStatusesInAction: NegativeStatusInAction[]
  modifiersInAction: ModifierInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]
}

type UpdateSnapshotsResult = {
  snapshots: Snapshot[]
  damageEvents: DamageEvent[]
  negativeStatusesInAction: NegativeStatusInAction[]
  modifiersInAction: ModifierInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]
}

export function updateSnapshotsWithAction(params: UpdateSnapshotsParams): UpdateSnapshotsResult {
  const validated = validateActionInputs(params)
  if (!validated) {
    return {
      snapshots: params.snapshots,
      damageEvents: [],
      negativeStatusesInAction: params.negativeStatusesInAction,
      modifiersInAction: params.modifiersInAction,
      coordinatedAttacksInAction: params.coordinatedAttacksInAction,
    }
  }

  const { index, character, action, snapshots, prev, enemy, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction, charactersMap, characterColumnsMap, globalColumns } = validated
  const updatedSnapshots = copySnapshots(snapshots)
  const current = updatedSnapshots[index]

  // -------- Resolvers -------------------------
  const context = buildStepContext(index, current, prev, character, action, enemy, negativeStatusesInAction, modifiersInAction, charactersMap, coordinatedAttacksInAction)

  resolveTime(context)
  resolveDamageModifiers(context)
  resolveDamage(context)
  resolveSideEffectsAndStatuses(context)
  resolveCoordinatedAttacks(context)
  resolveResources(context)
  resolveResourceMilestones(context)
  resolveOffFieldTriggers(context)
  resolveModifierState(context)
  resolveCooldowns(context)
  resolveCastState(context)

  // -------- Update snapshot -------------------
  updatedSnapshots[index] = { ...context.current }

  // -------- Create Next Blank Snapshot --------
  if (index === updatedSnapshots.length - 1) {
    updatedSnapshots.push(createSnapshot(updatedSnapshots[updatedSnapshots.length - 1], charactersMap, characterColumnsMap, globalColumns))
  }

  return {
    snapshots: updatedSnapshots,
    damageEvents: context.damageEvents,
    negativeStatusesInAction: context.negativeStatusesInAction,
    modifiersInAction: context.modifiersInAction,
    coordinatedAttacksInAction: context.coordinatedAttacksInAction,
  }
}

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

// ========== Autocast Follow-Up Chain =========================================================================================

type AutocastParams = {
  snapshots: Snapshot[]
  resolvedSnapshotId: number
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  negativeStatusesInAction: NegativeStatusInAction[]
  modifiersInAction: ModifierInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]
  maxDepth?: number
}

type AutocastResult = {
  snapshots: Snapshot[]
  damageEvents: DamageEvent[]
  negativeStatusesInAction: NegativeStatusInAction[]
  modifiersInAction: ModifierInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]
}

/**
 * Walks the attemptFollowUp chain from the resolved snapshot and automatically
 * casts each follow-up action in sequence, stopping when there is no further
 * follow-up or when a follow-up cannot be resolved.
 *
 * MUST follow-ups are always auto-cast.
 * "If possible" follow-ups (must === false) are auto-cast only when the follow-up
 * is actually castable in the current state; otherwise the chain stops.
 */
export function autocastFollowUpChain(params: AutocastParams): AutocastResult {
  let { snapshots, resolvedSnapshotId, maxDepth, ...rest } = params
  let { negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction } = rest
  const allDamageEvents: DamageEvent[] = []

  let depth = 0
  while (true) {
    if (maxDepth !== undefined && depth >= maxDepth) break

    const resolvedIndex = getSnapshotIndex(snapshots, resolvedSnapshotId)
    if (resolvedIndex === -1) break

    const resolvedSnapshot = snapshots[resolvedIndex]
    const characterName = resolvedSnapshot.character
    if (!characterName) break

    const followUpEntry = resolvedSnapshot.charactersAttemptFollowUp?.[characterName]
    if (!followUpEntry) break

    const { actionName: followUpActionName, must } = followUpEntry

    const character = rest.charactersMap[characterName]
    const followUpAction = character?.actions.find(
      a => a.name === followUpActionName || a.groupName === followUpActionName,
    )
    if (!character || !followUpAction || !isFollowUpCastableNow(followUpAction, resolvedSnapshot, character)) {
      break
    }

    if (!must) {
      if (!validateMustChain(followUpAction, resolvedSnapshot, character, character.actions)) {
        break
      }
    }

    const nextBlankIndex = resolvedIndex + 1
    if (nextBlankIndex >= snapshots.length) break

    if (!snapshots[nextBlankIndex].character) {
      snapshots = snapshots.map((s, i) => (i === nextBlankIndex ? assignCharacterToRow(s, characterName) : s))
    }

    const nextSnapshotId = Number(snapshots[nextBlankIndex].id)

    const result = updateSnapshotsWithAction({
      ...rest,
      snapshots,
      snapshotId: nextSnapshotId,
      actionName: followUpActionName,
      negativeStatusesInAction,
      modifiersInAction,
      coordinatedAttacksInAction,
    })
    snapshots = result.snapshots
    allDamageEvents.push(...result.damageEvents)
    negativeStatusesInAction = result.negativeStatusesInAction
    modifiersInAction = result.modifiersInAction
    coordinatedAttacksInAction = result.coordinatedAttacksInAction

    const castIdx = snapshots.findIndex(s => Number(s.id) === nextSnapshotId)
    if (castIdx !== -1) snapshots[castIdx] = { ...snapshots[castIdx], isAutocast: true }

    resolvedSnapshotId = nextSnapshotId
    depth++
  }

  return { snapshots, damageEvents: allDamageEvents, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction }
}

// ========== Internal: Validate Action Inputs =================================================================================

function validateActionInputs(params: UpdateSnapshotsParams) {
  const { snapshots, snapshotId, actionName, enemy, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction, charactersMap, characterColumnsMap, globalColumns } = params

  const index = getSnapshotIndex(snapshots, snapshotId)
  if (index === -1) return null

  const current = snapshots[index]
  if (!current.character) return null

  const character = getCharacter(charactersMap, current.character)
  if (!character) return null

  const prev = getPrevSnapshot(snapshots, index)
  const action = getActionFromCharacter(charactersMap, current.character, actionName, prev)
  if (!action) return null

  return { index, character, action, snapshots, current, prev, enemy, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction, charactersMap, characterColumnsMap, globalColumns }
}
