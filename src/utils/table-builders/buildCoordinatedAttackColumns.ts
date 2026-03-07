import type { Character } from '../../types/character'
import type { ColumnGroup, ColumnDef, StatusMetadata } from '../../types/tableDefinitions'
import { createOptionalGroup } from './helpers'
import { makeCoordinatedAttackKey } from '../hooks/coordinatedAttackHelpers'

const COORDINATED_ATTACK_COLOR = '#00BFFF'

// ========== Build Coordinated Attacks Column Group ===========================================================================

export function buildCoordinatedAttackColumns(selectedCharacters: Character[]): ColumnGroup | null {
  const coordAttacksMeta: StatusMetadata[] = selectedCharacters.flatMap(c =>
    c.actions.flatMap(a =>
      (a.coordinatedAttacks ?? []).map(ca => ({
        key: makeCoordinatedAttackKey(c.name, ca.name),
        label: `${c.name}: ${ca.displayName ?? ca.name}`,
        icon: ca.icon ?? `/assets/${ca.name.toLowerCase().replace(/\s+/g, '_')}.png`,
        maxStacks: 1,
        color: ca.color ?? COORDINATED_ATTACK_COLOR,
      })),
    ),
  )

  // Deduplicate by key
  const seenKeys = new Set<string>()
  const uniqueCoordAttacksMeta = coordAttacksMeta.filter(m => {
    if (seenKeys.has(m.key)) return false
    seenKeys.add(m.key)
    return true
  })

  const columns: ColumnDef[] = uniqueCoordAttacksMeta.length > 0
    ? [
        {
          key: 'coordinatedAttacks',
          label: 'Coordinated Attacks',
          icon: 'assets/coordinated_attack.png',
          statusMetadata: uniqueCoordAttacksMeta,
          render: () => null,
        },
      ]
    : []

  return createOptionalGroup(
    { label: 'Coordinated Attacks', icon: 'assets/coordinated_attack.png' },
    columns,
  )
}
