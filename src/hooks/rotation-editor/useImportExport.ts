import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { GlobalColumns, TableConfig } from '../../types/tableDefinitions'
import type { DamageEvent } from '../../types/events'
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import type { ModifierInAction } from '../../types/modifiers'
import type { CoordinatedAttackInAction } from '../../types/coordinatedAttack'
import type { Action } from '../../types/action'
import type { Settings } from '../useSettings'
import { negativeStatuses as negativeStatusesData } from '../../data/negativeStatuses'
import { getActionFromCharacter } from '../../utils/hooks/actionHelpers'
import { assignCharacterToRow } from '../../utils/hooks/snapshotHelpers'
import { getActionCooldownKey } from '../../utils/hooks/cooldownHelpers'
import { createEmptySnapshot } from './useSnapshots'
import {
  updateSnapshotsWithAction,
  shouldTriggerOutroIntro,
  handleOutroIntroFlow,
  autocastFollowUpChain,
  type EngineState,
} from '../../utils/engine/step'
import {
  loadSavedRotations,
  saveRotationToStorage,
  deleteRotationFromStorage,
  loadSavedSnippets,
  saveSnippetToStorage,
  deleteSnippetFromStorage,
  extractSteps,
  downloadRotationAsJson,
  parseRotationFromJson,
  type SavedRotation,
  type RotationStep,
  type ImportError,
  type ImportRunResult,
} from '../../utils/importExport'

// ========== Hook: useImportExport ============================================================================================

type UseImportExportProps = {
  snapshots: Snapshot[]
  setSnapshots: Dispatch<SetStateAction<Snapshot[]>>
  setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>
  resetTimeline: () => void
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  tableConfig: TableConfig
  enemy: Enemy
  settings: Settings
  negativeStatusesInAction: React.MutableRefObject<NegativeStatusInAction[]>
  modifiersInAction: React.MutableRefObject<ModifierInAction[]>
  coordinatedAttacksInAction: React.MutableRefObject<CoordinatedAttackInAction[]>
}

export function useImportExport({
  snapshots,
  setSnapshots,
  setDamageEvents,
  resetTimeline,
  charactersMap,
  characterColumnsMap,
  globalColumns,
  tableConfig,
  enemy,
  settings,
  negativeStatusesInAction,
  modifiersInAction,
  coordinatedAttacksInAction,
}: UseImportExportProps) {
  const [savedRotations, setSavedRotations] = useState<SavedRotation[]>(() => loadSavedRotations())
  const [savedSnippets, setSavedSnippets] = useState<SavedRotation[]>(() => loadSavedSnippets())
  const [lastImportError, setLastImportError] = useState<ImportError | null>(null)
  const [lastImportCompleted, setLastImportCompleted] = useState<number | null>(null)
  const [ignoreCastConditions, setIgnoreCastConditions] = useState(false)

  function refreshSaved() {
    setSavedRotations(loadSavedRotations())
  }

  function refreshSnippets() {
    setSavedSnippets(loadSavedSnippets())
  }

  function handleSave(name: string) {
    const steps = extractSteps(snapshots)
    if (steps.length === 0) return
    const rotation: SavedRotation = { name: name.trim(), createdAt: new Date().toISOString(), steps }
    saveRotationToStorage(rotation)
    refreshSaved()
  }

  function handleDelete(name: string) {
    deleteRotationFromStorage(name)
    refreshSaved()
  }

  function handleSaveSnippet(name: string) {
    const steps = extractSteps(snapshots)
    if (steps.length === 0) return
    const snippet: SavedRotation = { name: name.trim(), createdAt: new Date().toISOString(), steps }
    saveSnippetToStorage(snippet)
    refreshSnippets()
  }

  function handleDeleteSnippet(name: string) {
    deleteSnippetFromStorage(name)
    refreshSnippets()
  }

  function handleAppend(snippet: SavedRotation) {
    const result = runImportSteps({
      steps: snippet.steps,
      startingSnapshots: snapshots,
      initialNegativeStatuses: negativeStatusesInAction.current,
      initialModifiers: modifiersInAction.current,
      initialCoordinatedAttacks: coordinatedAttacksInAction.current,
      charactersMap,
      characterColumnsMap,
      globalColumns,
      enemy,
      settings,
      ignoreCastConditions,
    })

    setLastImportError(result.error)
    setLastImportCompleted(result.completedSteps)

    if (result.error) {
      // Do not reset on append error — keep current timeline intact
      return
    }

    setSnapshots(result.snapshots)
    setDamageEvents(prev => [...prev, ...result.damageEvents])
    negativeStatusesInAction.current = result.finalNegativeStatuses
    modifiersInAction.current = result.finalModifiers
    coordinatedAttacksInAction.current = result.finalCoordinatedAttacks
  }

  function handleDownload() {
    const steps = extractSteps(snapshots)
    if (steps.length === 0) return
    const name = `Rotation ${new Date().toLocaleDateString()}`
    downloadRotationAsJson({ name, createdAt: new Date().toISOString(), steps })
  }

  function handleLoad(rotation: SavedRotation) {
    const result = runImportSteps({
      steps: rotation.steps,
      initialSnapshot: createEmptySnapshot(charactersMap, characterColumnsMap, globalColumns, tableConfig, settings.startWithFullEnergy),
      charactersMap,
      characterColumnsMap,
      globalColumns,
      enemy,
      settings,
      ignoreCastConditions,
    })

    setLastImportError(result.error)
    setLastImportCompleted(result.completedSteps)

    if (result.error) {
      // Reset the table to a clean state so the partial import doesn't cause confusion
      resetTimeline()
      setDamageEvents([])
      negativeStatusesInAction.current = Object.values(negativeStatusesData).map(status => ({
        negativeStatus: status,
        applicationTime: -1,
        timeLeft: 0,
        currentStacks: 0,
        lastDamageTime: 0,
      }))
      modifiersInAction.current = []
      coordinatedAttacksInAction.current = []
      return
    }

    setSnapshots(result.snapshots)
    setDamageEvents(result.damageEvents)

    // Update living refs to reflect the imported state so subsequent user edits
    // continue from the correct modifier/coordinated-attack state.
    negativeStatusesInAction.current = result.finalNegativeStatuses
    modifiersInAction.current = result.finalModifiers
    coordinatedAttacksInAction.current = result.finalCoordinatedAttacks
  }

  function handleFileUpload(content: string) {
    const rotation = parseRotationFromJson(content)
    if (!rotation) {
      setLastImportError({ stepIndex: -1, character: '', action: '', reason: 'Invalid file format' })
      setLastImportCompleted(null)
      return
    }
    handleLoad(rotation)
  }

  function handleDownloadNamed(name: string) {
    const steps = extractSteps(snapshots)
    if (steps.length === 0) return
    downloadRotationAsJson({ name, createdAt: new Date().toISOString(), steps })
  }

  function handleDeleteFromSnapshot(snapshotId: number) {
    const index = snapshots.findIndex(s => Number(s.id) === snapshotId)
    if (index === -1) return

    // When deleting an autocast follow-up row, we want to replay the triggering user step
    // but regenerate only the autocasts that came BEFORE the deleted row. Walk back through
    // the consecutive autocast chain to its start, then count how many hops to allow.
    // Example: chain [user A → autocast B → autocast C], deleting C → allow 1 hop (keeps B).
    //          Deleting B → allow 0 hops (no follow-ups replayed at all).
    // Outro/Intro autocasts are NOT follow-up chains (no charactersAttemptFollowUp on the
    // row before them), so they fall through to the normal path unchanged.
    let maxAutocasts: number | undefined = undefined
    if (snapshots[index].isAutocast) {
      const charName = snapshots[index].character ?? ''
      let chainStart = index
      while (chainStart > 0 && snapshots[chainStart - 1].isAutocast) {
        chainStart--
      }
      const triggerRow = chainStart > 0 ? snapshots[chainStart - 1] : null
      const isFollowUpChain =
        !!charName &&
        triggerRow != null &&
        !triggerRow.isAutocast &&
        !!triggerRow.action &&
        !!triggerRow.charactersAttemptFollowUp?.[charName]
      if (isFollowUpChain) {
        // chainStart is the index of the first autocast. index - chainStart equals the
        // number of autocast rows before the deleted one, i.e. the hops to keep.
        maxAutocasts = index - chainStart
      }
    }

    const stepsToKeep = extractSteps(snapshots.slice(0, index))

    if (stepsToKeep.length === 0) {
      resetTimeline()
      setDamageEvents([])
      negativeStatusesInAction.current = Object.values(negativeStatusesData).map(status => ({
        negativeStatus: status,
        applicationTime: -1,
        timeLeft: 0,
        currentStacks: 0,
        lastDamageTime: 0,
      }))
      modifiersInAction.current = []
      coordinatedAttacksInAction.current = []
      return
    }

    const result = runImportSteps({
      steps: stepsToKeep,
      initialSnapshot: createEmptySnapshot(charactersMap, characterColumnsMap, globalColumns, tableConfig, settings.startWithFullEnergy),
      charactersMap,
      characterColumnsMap,
      globalColumns,
      enemy,
      settings,
      maxAutocasts,
      ignoreCastConditions: false,
    })

    setSnapshots(result.snapshots)
    setDamageEvents(result.damageEvents)
    negativeStatusesInAction.current = result.finalNegativeStatuses
    modifiersInAction.current = result.finalModifiers
    coordinatedAttacksInAction.current = result.finalCoordinatedAttacks
  }

  return {
    savedRotations,
    savedSnippets,
    lastImportError,
    lastImportCompleted,
    ignoreCastConditions,
    setIgnoreCastConditions,
    handleSave,
    handleDelete,
    handleSaveSnippet,
    handleDeleteSnippet,
    handleAppend,
    handleLoad,
    handleDownload,
    handleDownloadNamed,
    handleFileUpload,
    handleDeleteFromSnapshot,
    clearImportStatus: () => { setLastImportError(null); setLastImportCompleted(null) },
  }
}

// ========== Failure Reason Detection =========================================================================================

function getActionFailureReason(action: Action, prevSnapshot: Snapshot | undefined, character: ResolvedCharacter, ignoreCastConditions: boolean, skipAllChecks = false): string | null {
  if (skipAllChecks) return null

  const charName = character.name

  // Must follow-up check (the action is locked until a specific follow-up is cast)
  if (prevSnapshot) {
    const followUpEntry = prevSnapshot.charactersAttemptFollowUp?.[charName]
    if (followUpEntry?.must) {
      const isThisTheFollowUp = action.name === followUpEntry.actionName || action.groupName === followUpEntry.actionName
      if (!isThisTheFollowUp) {
        return `Must cast "${followUpEntry.actionName}" as a required follow-up before "${action.displayName}"`
      }
    }
  }

  // Energy check
  if (!ignoreCastConditions) {
    const energies = prevSnapshot?.charactersEnergies?.[charName] ?? {}
    for (const cost of action.energyCost) {
      const current = energies[cost.energyType] ?? 0
      if (current < cost.amount) {
        return `Not enough ${cost.energyType} to cast "${action.displayName}" (need ${cost.amount}, have ${Math.round(current * 10) / 10})`
      }
    }
  }

  // Position check
  if (!ignoreCastConditions) {
    const position = prevSnapshot?.charactersPositions?.[charName] ?? 'GROUND'
    if (action.castConditions.startState !== 'ANY' && action.castConditions.startState !== position) {
      return `"${action.displayName}" requires ${action.castConditions.startState} position (currently ${position})`
    }
  }

  // Form check
  if (action.castConditions.requiredForms !== undefined) {
    const storedForm = prevSnapshot?.charactersForms?.[charName] ?? ''
    const resolvedForm =
      storedForm ||
      character.forms?.find(f => f.name === character.defaultForm)?.name ||
      character.forms?.[0]?.name ||
      ''
    if (action.castConditions.requiredForms.length === 0 || !action.castConditions.requiredForms.includes(resolvedForm)) {
      const required = action.castConditions.requiredForms.join(' or ')
      return `"${action.displayName}" requires ${required || 'unavailable'} form (currently ${resolvedForm || 'default'})`
    }
  }

  // Cooldown check
  const cooldownKey = getActionCooldownKey(action)
  const cooldownRemaining = prevSnapshot?.charactersCooldowns?.[charName]?.[cooldownKey] ?? 0
  if (cooldownRemaining > 0) {
    // For stacked actions, being on the recharge timer doesn't block casting — only empty stacks do
    if (action.maxStacks && action.maxStacks > 1) {
      const storedStacks = prevSnapshot?.charactersActionStacks?.[charName]?.[cooldownKey]
      const currentStacks = storedStacks ?? action.maxStacks
      if (currentStacks === 0) {
        return `"${action.displayName}" has no charges left (${cooldownRemaining.toFixed(1)}s until next charge)`
      }
    } else {
      return `"${action.displayName}" is on cooldown (${cooldownRemaining.toFixed(1)}s remaining)`
    }
  }

  if (!ignoreCastConditions) {
    // Custom cast condition
    if (action.castConditions.customCanCast && prevSnapshot) {
      if (!action.castConditions.customCanCast(prevSnapshot, charName)) {
        return `"${action.displayName}" cannot be cast at this point (a cast condition is not met)`
      }
    }
  }

  return null
}

// ========== Synchronous Import Runner ========================================================================================

type ImportRunParams = {
  steps: RotationStep[]
  initialSnapshot?: Snapshot
  startingSnapshots?: Snapshot[]
  initialNegativeStatuses?: NegativeStatusInAction[]
  initialModifiers?: ModifierInAction[]
  initialCoordinatedAttacks?: CoordinatedAttackInAction[]
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  settings: Settings
  ignoreCastConditions: boolean
  /** When set, caps how many autocast follow-up hops the LAST replayed step may generate.
   *  All earlier steps in the replay are unaffected. Used by deletion to stop the chain
   *  before the deleted row without losing earlier autocasts in the same chain. */
  maxAutocasts?: number
}

type FullImportRunResult = ImportRunResult & {
  finalNegativeStatuses: NegativeStatusInAction[]
  finalModifiers: ModifierInAction[]
  finalCoordinatedAttacks: CoordinatedAttackInAction[]
}

function runImportSteps(params: ImportRunParams): FullImportRunResult {
  const { steps, initialSnapshot, startingSnapshots, initialNegativeStatuses, initialModifiers, initialCoordinatedAttacks, charactersMap, characterColumnsMap, globalColumns, enemy, settings, ignoreCastConditions, maxAutocasts } = params

  let snapshots: Snapshot[] = startingSnapshots
    ? [...startingSnapshots]
    : [{ ...initialSnapshot! }]
  let localDamageEvents: DamageEvent[] = []

  // Fresh engine state for this import run — isolated from the living refs
  let engineState: EngineState = {
    negativeStatusesInAction: initialNegativeStatuses
      ? initialNegativeStatuses.map(s => ({ ...s }))
      : Object.values(negativeStatusesData).map(status => ({
          negativeStatus: status,
          applicationTime: -1,
          timeLeft: 0,
          currentStacks: 0,
          lastDamageTime: 0,
        })),
    modifiersInAction: initialModifiers ? [...initialModifiers] : [],
    coordinatedAttacksInAction: initialCoordinatedAttacks ? initialCoordinatedAttacks.map(ca => ({ ...ca })) : [],
  }

  const baseEngineParams = {
    charactersMap,
    characterColumnsMap,
    globalColumns,
    enemy,
  }

  let completedSteps = 0

  for (let stepIdx = 0; stepIdx < steps.length; stepIdx++) {
    const step = steps[stepIdx]

    // Validate character
    const character = charactersMap[step.character]
    if (!character) {
      return {
        snapshots,
        damageEvents: localDamageEvents,
        completedSteps,
        error: { stepIndex: stepIdx, character: step.character, action: step.action, reason: `Character "${step.character}" is not in the current battle` },
        finalNegativeStatuses: engineState.negativeStatusesInAction,
        finalModifiers: engineState.modifiersInAction,
        finalCoordinatedAttacks: engineState.coordinatedAttacksInAction,
      }
    }

    // Assign character to the last blank row
    const lastIdx = snapshots.length - 1
    snapshots = snapshots.map((s, i) => (i === lastIdx ? assignCharacterToRow(s, step.character) : s))
    let snapshotId = Number(snapshots[lastIdx].id)

    // Handle automatic Outro/Intro if character changed and previous had full concerto
    if (shouldTriggerOutroIntro(snapshots, snapshotId)) {
      try {
        const outroIntroResult = handleOutroIntroFlow({ snapshots, snapshotId, ...engineState, ...baseEngineParams })
        snapshots = outroIntroResult.snapshots
        localDamageEvents = [...localDamageEvents, ...outroIntroResult.damageEvents]
        engineState = {
          negativeStatusesInAction: outroIntroResult.negativeStatusesInAction,
          modifiersInAction: outroIntroResult.modifiersInAction,
          coordinatedAttacksInAction: outroIntroResult.coordinatedAttacksInAction,
        }
      } catch (e) {
        const reason = e instanceof Error ? e.message : String(e)
        return {
          snapshots,
          damageEvents: localDamageEvents,
          completedSteps,
          error: { stepIndex: stepIdx, character: step.character, action: step.action, reason },
          finalNegativeStatuses: engineState.negativeStatusesInAction,
          finalModifiers: engineState.modifiersInAction,
          finalCoordinatedAttacks: engineState.coordinatedAttacksInAction,
        }
      }
      snapshotId += 2
    }

    // Resolve the action variant (e.g. plunge tier selection)
    const targetIdx = snapshots.findIndex(s => Number(s.id) === snapshotId)
    const prevSnapshot = targetIdx > 0 ? snapshots[targetIdx - 1] : undefined
    const resolvedAction = getActionFromCharacter(charactersMap, step.character, step.action, prevSnapshot)

    if (!resolvedAction) {
      return {
        snapshots,
        damageEvents: localDamageEvents,
        completedSteps,
        error: { stepIndex: stepIdx, character: step.character, action: step.action, reason: `Action "${step.action}" not found for ${step.character}` },
        finalNegativeStatuses: engineState.negativeStatusesInAction,
        finalModifiers: engineState.modifiersInAction,
        finalCoordinatedAttacks: engineState.coordinatedAttacksInAction,
      }
    }

    // Check if the action is castable in the current state
    const failureReason = getActionFailureReason(resolvedAction, prevSnapshot, character, ignoreCastConditions, settings.sandboxMode)
    if (failureReason) {
      return {
        snapshots,
        damageEvents: localDamageEvents,
        completedSteps,
        error: { stepIndex: stepIdx, character: step.character, action: step.action, reason: failureReason },
        finalNegativeStatuses: engineState.negativeStatusesInAction,
        finalModifiers: engineState.modifiersInAction,
        finalCoordinatedAttacks: engineState.coordinatedAttacksInAction,
      }
    }

    // Apply the action through the full resolver pipeline
    const actionResult = updateSnapshotsWithAction({ ...baseEngineParams, ...engineState, snapshots, snapshotId, actionName: step.action })
    snapshots = actionResult.snapshots
    localDamageEvents = [...localDamageEvents, ...actionResult.damageEvents]
    engineState = {
      negativeStatusesInAction: actionResult.negativeStatusesInAction,
      modifiersInAction: actionResult.modifiersInAction,
      coordinatedAttacksInAction: actionResult.coordinatedAttacksInAction,
    }

    if (settings.autocastFollowUps) {
      const isLastStep = stepIdx === steps.length - 1
      const autocastResult = autocastFollowUpChain({ ...baseEngineParams, ...engineState, snapshots, resolvedSnapshotId: snapshotId, maxDepth: isLastStep ? maxAutocasts : undefined })
      snapshots = autocastResult.snapshots
      localDamageEvents = [...localDamageEvents, ...autocastResult.damageEvents]
      engineState = {
        negativeStatusesInAction: autocastResult.negativeStatusesInAction,
        modifiersInAction: autocastResult.modifiersInAction,
        coordinatedAttacksInAction: autocastResult.coordinatedAttacksInAction,
      }
    }

    completedSteps++
  }

  return {
    snapshots,
    damageEvents: localDamageEvents,
    completedSteps,
    error: null,
    finalNegativeStatuses: engineState.negativeStatusesInAction,
    finalModifiers: engineState.modifiersInAction,
    finalCoordinatedAttacks: engineState.coordinatedAttacksInAction,
  }
}
