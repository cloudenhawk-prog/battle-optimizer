/**
 * Golden-test fixture that rebuilds the engine inputs exactly the way the rotation editor UI does.
 *
 * Kept deliberately independent from the app's own derivation helpers: this file is the
 * reference the refactor is measured against, so it must not move when the app code moves.
 */

import * as fs from 'fs'
import * as path from 'path'
import type { ResolvedCharacter } from '../../src/types/character'
import type { GlobalColumns, TableConfig } from '../../src/types/tableDefinitions'
import type { Snapshot } from '../../src/types/snapshot'
import type { DamageEvent } from '../../src/types/events'
import type { Settings } from '../../src/types/settings'
import { characters } from '../../src/data/characters'
import { enemies } from '../../src/data/enemies'
import { buildTableConfig } from '../../src/tableConfig/buildTableConfig'
import { createEmptySnapshot } from '../../src/engine/state/createEmptySnapshot'

export const DEFAULT_SETTINGS: Settings = {
  autocastFollowUps: false,
  startWithFullEnergy: false,
  sandboxMode: false,
  rowDeletionMode: false,
  useFixedStacks: false,
  triggerOutroIntroOnCharacterSelect: false,
}

export type AppSetup = {
  team: ResolvedCharacter[]
  tableConfig: TableConfig
  charactersMap: Record<string, ResolvedCharacter>
  /** Import/replay path (useRotationEditor): energy keys straight from maxEnergies. */
  importColumnsMap: Record<string, string[]>
  /** Live-edit path (useCharacterActions): energy keys parsed from the table config column keys. */
  liveColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: typeof enemies[number]
  emptySnapshot: (settings: Settings) => Snapshot
}

export function buildAppSetup(team: ResolvedCharacter[] = characters): AppSetup {
  const tableConfig = buildTableConfig(team)
  const charactersMap = Object.fromEntries(team.map(c => [c.name, c]))
  const importColumnsMap = Object.fromEntries(team.map(c => [c.name, Object.keys(c.maxEnergies)]))
  const liveColumnsMap = Object.fromEntries(tableConfig.characters.map(c => [c.label, c.columns.map(col => col.key.slice(col.key.indexOf('_') + 1))]))

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

  return {
    team,
    tableConfig,
    charactersMap,
    importColumnsMap,
    liveColumnsMap,
    globalColumns,
    enemy: enemies[0],
    emptySnapshot: settings => createEmptySnapshot(charactersMap, importColumnsMap, globalColumns, tableConfig, settings.startWithFullEnergy),
  }
}

/** Saved rotations shipped in DOCS/ — real-world rotations built by the user in the editor. */
export function loadDocRotations(): { file: string; rotation: { name: string; steps: { character: string; action: string }[] } }[] {
  const dir = path.join(__dirname, '..', '..', 'DOCS')
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(file => ({ file, rotation: JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) }))
}

/**
 * Captures everything observable about a damage event, including what the DataOverlay
 * buff-toggle closure (`calcParams.reEvaluate`) returns with no groups and with all groups on.
 */
export function summarizeDamageEvents(events: DamageEvent[]) {
  return events.map(e => {
    const { calcParams, ...rest } = e
    let reEvaluated: unknown = null
    if (calcParams?.reEvaluate) {
      const allKeys = new Set(Object.keys(e.contributions ?? {}))
      reEvaluated = {
        none: calcParams.reEvaluate(new Set()),
        all: calcParams.reEvaluate(allKeys),
      }
    }
    return { ...rest, finalCharacterStats: calcParams?.finalCharacterStats ?? null, reEvaluated }
  })
}
