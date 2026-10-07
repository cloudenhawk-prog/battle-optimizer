// Derives the column key lists the engine needs (status keys, energy keys) from the UI table config / roster.
import type { Character } from '../types/character'
import type { GlobalColumns, TableConfig } from '../types/tableDefinitions'

/**
 * Flattens the table config into the plain key lists that snapshots are initialised with:
 * basic columns plus every buff / debuff / negative-status key shown in the status columns.
 */
export function deriveGlobalColumns(tableConfig: TableConfig): GlobalColumns {
  const statusEffectsColumns = tableConfig.statusEffects?.columns ?? []
  const buffsCol = statusEffectsColumns.find(col => col.key === 'buffs')
  const debuffsCol = statusEffectsColumns.find(col => col.key === 'debuffs')
  const negativeStatusesCol = statusEffectsColumns.find(col => col.key === 'negativeStatuses')

  return {
    basic: tableConfig.basic.columns.map(col => col.key),
    buffs: buffsCol?.statusMetadata?.map(meta => meta.key) ?? [],
    debuffs: debuffsCol?.statusMetadata?.map(meta => meta.key) ?? [],
    negativeStatuses: negativeStatusesCol?.statusMetadata?.map(meta => meta.key) ?? [],
  }
}

/** Energy keys per character, straight from each character's maxEnergies (used to seed row 0). */
export function energyColumnsByCharacter(characters: Character[]): Record<string, string[]> {
  return Object.fromEntries(characters.map(c => [c.name, Object.keys(c.maxEnergies)]))
}

/**
 * Energy keys per character parsed from the table's per-character column keys ("<char>_<energy>").
 * The engine threads this map through but never reads it (see createSnapshot); kept for API parity.
 */
export function energyColumnsFromTableConfig(tableConfig: TableConfig): Record<string, string[]> {
  return Object.fromEntries(tableConfig.characters.map(c => [c.label, c.columns.map(col => col.key.slice(col.key.indexOf('_') + 1))]))
}
