import type { Character } from '../../types/character'
import type { ColumnGroup, ColumnDef, StatusMetadata } from '../../types/tableDefinitions'
import { createOptionalGroup } from './helpers'

// ========== Build Negative Statuses Column Group =============================================================================

export function buildNegativeStatusColumns(selectedCharacters: Character[]): ColumnGroup | null {
  const activeStatuses = Array.from(new Set(selectedCharacters.flatMap(c => c.actions.flatMap(action => action.statusModifications.filter(mod => mod.type === 'negativeStatus').map(mod => mod.targetName)))))

  // Build metadata for all negative statuses
  const statusMetadata: StatusMetadata[] = activeStatuses.map(status => ({
    key: status,
    label: status,
    icon: `/assets/${status.toLowerCase().replace(/\s+/g, '_')}.png`,
  }))

  // Create a single column that will render all negative statuses as tags
  const columns: ColumnDef[] = [
    {
      key: 'negativeStatuses',
      label: 'Negative Statuses',
      icon: 'assets/negativeStatuses.png',
      statusMetadata,
      render: () => null, // Rendering is handled by StatusTagGroup in the table
    },
  ]

  return createOptionalGroup({ label: 'Negative Statuses', icon: 'assets/negativeStatuses.png' }, columns)
}
