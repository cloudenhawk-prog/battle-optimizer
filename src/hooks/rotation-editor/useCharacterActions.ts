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
import { copySnapshots } from '../../utils/hooks/snapshotHelpers'
import type { Settings } from '../useSettings'
import { engineStep, initEngineState } from '../../utils/engine/step'

// Re-export pure engine functions for callers that imported them from here
export {
  updateSnapshotsWithAction,
  shouldTriggerOutroIntro,
  handleOutroIntroFlow,
  autocastFollowUpChain,
  type EngineState,
} from '../../utils/engine/step'

// ========== Hook: useCharacterActions ========================================================================================

type UseCharacterActionsProps = {
  setSnapshots: Dispatch<SetStateAction<Snapshot[]>>
  charactersInBattle: ResolvedCharacter[]
  enemy: Enemy
  tableConfig: TableConfig
  setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>
  settings: Settings
}

export function useCharacterActions({ setSnapshots, charactersInBattle, enemy, tableConfig, setDamageEvents, settings }: UseCharacterActionsProps) {
  const charactersMap: Record<string, ResolvedCharacter> = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))
  const characterColumnsMap: Record<string, string[]> = Object.fromEntries(tableConfig.characters.map(c => [c.label, c.columns.map(col => col.key.slice(col.key.indexOf('_') + 1))]))

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

  // Persistent engine state — survives across action selections
  const engineStateRef = useRef(initEngineState())

  // Expose refs for useImportExport (it reads/writes .current directly after imports)
  const negativeStatusesInAction = useRef<NegativeStatusInAction[]>(engineStateRef.current.negativeStatusesInAction)
  const modifiersInAction = useRef<ModifierInAction[]>(engineStateRef.current.modifiersInAction)
  const coordinatedAttacksInAction = useRef<CoordinatedAttackInAction[]>(engineStateRef.current.coordinatedAttacksInAction)

  // Keep the three public refs in sync with the internal engineStateRef
  function syncRefs() {
    negativeStatusesInAction.current = engineStateRef.current.negativeStatusesInAction
    modifiersInAction.current = engineStateRef.current.modifiersInAction
    coordinatedAttacksInAction.current = engineStateRef.current.coordinatedAttacksInAction
  }

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
      const result = engineStep({
        snapshots: copySnapshots(prevSnapshots),
        snapshotId,
        actionName,
        engineState: engineStateRef.current,
        charactersMap,
        characterColumnsMap,
        globalColumns,
        enemy,
        autocastFollowUps: settings.autocastFollowUps,
      })

      // Dispatch damage events to React state
      if (result.damageEvents.length > 0) {
        setDamageEvents(prev => [...prev, ...result.damageEvents])
      }

      // Persist updated engine state
      engineStateRef.current = result.engineState
      syncRefs()

      return result.snapshots
    })
  }

  return { handleCharacterSelect, handleActionSelect, coordinatedAttacksInAction, negativeStatusesInAction, modifiersInAction }
}
