import type { Character } from '../../types/character'
import type { TableConfig } from '../../types/tableDefinitions'
import { buildBasicColumns } from './buildBasicColumns'
import { buildCharacterGroupsColumns } from './buildCharacterGroupedColumns'
import { buildStatusEffectsColumns } from './buildStatusEffectsColumns'
import { buildOtherColumns } from './buildOtherColumns'

// ========== Build Table Config ===============================================================================================

export function buildTableConfig(selectedCharacters: Character[]): TableConfig {
  return {
    basic: buildBasicColumns(),
    characters: buildCharacterGroupsColumns(selectedCharacters),
    statusEffects: buildStatusEffectsColumns(selectedCharacters),
    other: buildOtherColumns(selectedCharacters),
  }
}
