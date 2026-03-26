import type { Character } from '../../types/character'
import type { ColumnGroup, ColumnDef } from '../../types/tableDefinitions'
import { createOptionalGroup } from './helpers'
import { buildCoordinatedAttackColumns } from './buildCoordinatedAttackColumns'

// ========== Build Other Column Group =========================================================================================

export function buildOtherColumns(selectedCharacters: Character[]): ColumnGroup | null {
  const columns: ColumnDef[] = []

  const caGroup = buildCoordinatedAttackColumns(selectedCharacters)
  if (caGroup) columns.push(...caGroup.columns)

  return createOptionalGroup(
    {
      label: 'Other',
      icon: 'assets/table/other.png',
    },
    columns,
  )
}
