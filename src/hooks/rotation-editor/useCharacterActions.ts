// Live-editing handlers: picking a character or an action on a row runs the engine and updates React state.
import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Dispatch, SetStateAction } from 'react'
import type { Enemy } from '../../types/enemy'
import type { DamageEvent } from '../../types/events'
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import type { ModifierInAction } from '../../types/modifiers'
import type { CoordinatedAttackInAction } from '../../types/coordinatedAttack'
import type { TableConfig } from '../../types/tableDefinitions'
import type { Settings } from '../../types/settings'
import { useRef } from 'react'
import { copySnapshots } from '../../engine/state/snapshotHelpers'
import { engineStep } from '../../engine/simulation/step'
import { initEngineState } from '../../engine/simulation/engineState'
import { shouldTriggerOutroIntro, handleOutroIntroFlow } from '../../engine/simulation/outroIntro'
import { deriveGlobalColumns, energyColumnsFromTableConfig } from '../../tableConfig/engineColumns'

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
  const characterColumnsMap = energyColumnsFromTableConfig(tableConfig)
  const globalColumns = deriveGlobalColumns(tableConfig)

  // Persistent engine state — survives across action selections.
  // These three refs are the canonical state; useImportExport writes to them directly.
  // Refs (not state) because they are read and written inside setSnapshots updaters.
  const initState = initEngineState()
  const negativeStatusesInAction = useRef<NegativeStatusInAction[]>(initState.negativeStatusesInAction)
  const modifiersInAction = useRef<ModifierInAction[]>(initState.modifiersInAction)
  const coordinatedAttacksInAction = useRef<CoordinatedAttackInAction[]>(initState.coordinatedAttacksInAction)

  const handleCharacterSelect = (snapshotId: number, characterName: string) => {
    setSnapshots(prev => {
      // Update the character for the specified snapshot and clear its action
      const updated = prev.map(s => (Number(s.id) === snapshotId ? { ...s, character: characterName, action: '' } : s))

      const currentIndex = updated.findIndex(s => Number(s.id) === snapshotId)
      if (currentIndex === -1) return updated

      // Picking a character on an earlier row discards everything after it, keeping one blank row.
      const truncated = updated.slice(0, currentIndex + 2)

      if (settings.triggerOutroIntroOnCharacterSelect && shouldTriggerOutroIntro(truncated, snapshotId)) {
        const result = handleOutroIntroFlow({
          snapshots: truncated,
          snapshotId,
          charactersMap,
          characterColumnsMap,
          globalColumns,
          enemy,
          negativeStatusesInAction: negativeStatusesInAction.current,
          modifiersInAction: modifiersInAction.current,
          coordinatedAttacksInAction: coordinatedAttacksInAction.current,
        })

        if (result.damageEvents.length > 0) {
          setDamageEvents(prev => [...prev, ...result.damageEvents])
        }

        negativeStatusesInAction.current = result.negativeStatusesInAction
        modifiersInAction.current = result.modifiersInAction
        coordinatedAttacksInAction.current = result.coordinatedAttacksInAction

        return result.snapshots
      }

      return truncated
    })
  }

  const handleActionSelect = (snapshotId: number, actionName: string) => {
    setSnapshots(prevSnapshots => {
      const result = engineStep({
        snapshots: copySnapshots(prevSnapshots),
        snapshotId,
        actionName,
        engineState: {
          negativeStatusesInAction: negativeStatusesInAction.current,
          modifiersInAction: modifiersInAction.current,
          coordinatedAttacksInAction: coordinatedAttacksInAction.current,
        },
        charactersMap,
        characterColumnsMap,
        globalColumns,
        enemy,
        autocastFollowUps: settings.autocastFollowUps,
      })

      if (result.damageEvents.length > 0) {
        setDamageEvents(prev => [...prev, ...result.damageEvents])
      }

      negativeStatusesInAction.current = result.engineState.negativeStatusesInAction
      modifiersInAction.current = result.engineState.modifiersInAction
      coordinatedAttacksInAction.current = result.engineState.coordinatedAttacksInAction

      return result.snapshots
    })
  }

  return { handleCharacterSelect, handleActionSelect, coordinatedAttacksInAction, negativeStatusesInAction, modifiersInAction }
}
